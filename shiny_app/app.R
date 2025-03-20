# Load packages with conflict resolution
library(shiny)
library(DBI)
library(RPostgres)
library(dplyr, warn.conflicts = FALSE)
library(metafor)
library(tidyverse, warn.conflicts = FALSE)
library(bslib)

# Database connection with error handling
con <- NULL  # Initialize connection as NULL
tryCatch({
  con <- dbConnect(RPostgres::Postgres(), 
                   dbname = Sys.getenv("POSTGRES_DB"), 
                   host = "db",
                   port = 5432, 
                   user = Sys.getenv("POSTGRES_USER"), 
                   password = Sys.getenv("POSTGRES_PASSWORD"))
  print("Database connection successful!")
}, error = function(e) {
  print(paste("Error connecting to database:", e$message))
  stop(e)
})

# Ensure connection is valid
if (is.null(con) || !DBI::dbIsValid(con)) {
  stop("Database connection is not valid")
}

# UI Definition
ui <- fluidPage(
  # website prep
  tags$head(tags$link(rel = "stylesheet", href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css")),
  theme = bs_theme(version = 4),
  
  # Application title
  titlePanel("Meta-analysis of Educational Interventions"),
  
  # Sidebar with inputs
  sidebarLayout(
    sidebarPanel(
      h5("Select your studies of interest"),
      # PICOS filters
      selectInput("category", "Select Category", 
                  choices = c("All", "Language", "STEM", "Math")),
      
      selectInput("intervention", "Select Intervention",
                  choices = "All"),
      
      selectInput("target_population", "Select Target Population",
                  choices = "All"),           
      
      selectInput("study_design",
                  label = "Select study design",
                  choices = c("All", "RCT", "QES")),
      
      selectInput("outcomes",
                  label = "Select outcomes",
                  choices = "All",  # Will be populated from server
                  #multiple = TRUE
      ),
      
      selectInput("test_name", 
                  label = "Select the measurement tool",
                  choices = "All",  # Will be populated from server
                  #multiple = TRUE
      ),
      
      selectInput("test_time", 
                  label = "Select test time",
                  choices = c("All","baseline"="1", "post_test"="2")),
      
      p("Click on empty fields to see all options, select multiple options by clicking on each one."),
      selectInput("grade",
                  label = "Select grade",
                  choices = NULL, #populate from server
                  multiple = TRUE
      ),
      
      h5("Define the meta-analysis"),
      # Meta-analysis filters
      selectInput("effect_type", 
                  label = "Select effect size type",
                  choices = c("Hedges' g" = "SMD",
                              "Mean difference" = "MD",
                              "Odds Ratio" = "OR"),
                  selected = "SMD"),
      
      selectInput("ma_model",
                  label = "Select meta-analysis model",
                  choices = c("Fixed-effects" = "FE", 
                              "Restricted Maximum likelihood Estimator" = "REML",
                              "DerSimonian-Laird" = "DL",
                              "Paule-Mandel estimator" = "PM"),
                  selected = "REML"),
      
      checkboxGroupInput("rob", 
                         label = "Select risk of bias",
                         choices = c("low", "some concern", "high", "N/A")),
      
      numericInput("conf",
                   label = "Select confidence level",
                   value = 0.05,
                   min = 0.001,
                   max = 0.1,
                   step = 0.001)
    ),
    
    # Main panel with outputs
    mainPanel(
      tabsetPanel(type = "tabs",
                  tabPanel("Forest plot",
                           wellPanel(style = "padding: 5px; border: solid 1px #337ab7; border-radius: 1px;",
                                     p("Pooled effect", style = "color: #337ab7;"),
                                     textOutput("effect")),
                           plotOutput("Plot1")),
                  tabPanel("Publication bias",
                           h3("Egger's regression test"),
                           verbatimTextOutput("regtest"),
                           h3("Funnel plot"),
                           plotOutput("Plot2", hover = hoverOpts(id ="hover_plot2")),
                           verbatimTextOutput("hover_info2")),
                  tabPanel("Summary", htmlOutput("Summary")),
                  tabPanel("Table", 
                           tableOutput("Table"),
                           downloadButton("download", "Download Data"))
      )
    )
  )
)

# Server logic
server <- function(input, output, session) {
  
  # Get initial data and set up intervention choices
  observe({
    query <- "SELECT DISTINCT e.intervention FROM myapi_experiment e WHERE e.intervention IS NOT NULL ORDER BY e.intervention"
    data <- dbGetQuery(con, query)
    updateSelectInput(session, "intervention", choices = c("All", data$intervention))
  })
  
  observe({
    query <- "SELECT DISTINCT e.target_population FROM myapi_experiment e WHERE e.target_population IS NOT NULL ORDER BY e.target_population"
    data <- dbGetQuery(con, query)
    updateSelectInput(session, "target_population", choices = c("All", data$target_population))
  })
  
  # Get initial outcomes choices
  observe({
    query <- "SELECT DISTINCT ef.outcome FROM myapi_effect ef WHERE ef.outcome IS NOT NULL ORDER BY ef.outcome"
    outcomes_data <- dbGetQuery(con, query)
    updateSelectInput(session, 
                      "outcomes",
                      choices = c("All", outcomes_data$outcome),
                      #selected = NULL
    )  # Start with none selected
  })
  
  # Get initial test name choices
  observe({
    query <- "SELECT DISTINCT ef.test_name FROM myapi_effect ef WHERE ef.test_name IS NOT NULL ORDER BY ef.test_name"
    test_names <- dbGetQuery(con, query)
    updateSelectInput(session, 
                      "test_name",
                      choices = c("All", test_names$test_name),
                      #selected = NULL
    )  # Start with none selected
  })
  
  # Get initial grade choices
  observe({
    query <- "SELECT DISTINCT grade_id FROM myapi_experiment WHERE grade_id IS NOT NULL"
    grades_data <- dbGetQuery(con, query)
    # Create grade choices
    grade_choices <- c("K" = "k", "1st" = "1", "2nd" = "2", "3rd" = "3",
                       "4th" = "4", "5th" = "5", "6th" = "6", "7th" = "7",
                       "8th" = "8", "9th" = "9", "10th" = "10", "11th" = "11",
                       "12th" = "12")
    updateSelectInput(session, 
                      "grade",
                      choices = grade_choices,
                      selected = NULL)
  })
  
  # Reactive dataset that gets filtered based on user inputs
  filtered_data <- reactive({
    # Get all studies and their effects
    query <- "
            SELECT s.study_id, s.title, s.authors, s.study_year, 
                   c.name as country, cat.name as category,
                   e.experiment_nr, sd.design as study_design, rob.rob as risks, e.grade_id as grade,
                   ef.effect_size_type_id as effect_size_type, ef.test_time_id as test_time, ef.outcome, ef.test_name,
                   NULLIF(ef.d, 0) as effect_size, NULLIF(ef.d_var, 0) as variance,
                   ef.m1i, ef.sd1i, ef.n1i, ef.m2i, ef.sd2i, ef.n2i,
                   ef.ai, ef.bi, ef.ci, ef.di,
                   NULLIF(ef.f_stat, 0) as f_stat,
                   NULLIF(ef.t, 0) as t_stat,
                   NULLIF(ef.ri, 0) as ri,
                   NULLIF(ef.icc, 0) as icc,
                   e.intervention
            FROM myapi_study s
            LEFT JOIN myapi_country c ON s.country_id = c.id
            LEFT JOIN myapi_category cat ON s.category_id = cat.id
            JOIN myapi_experiment e ON s.study_id = e.study_id_id
            LEFT JOIN myapi_studydesign sd ON e.study_design_id = sd.id
            LEFT JOIN myapi_riskofbias rob ON e.risks_id = rob.id
            JOIN myapi_effect ef ON e.experiment_nr = ef.experiment_nr_id
        "
    data <- dbGetQuery(con, query)
    
    # Apply filters
    if (input$category != "All") {
      data <- data %>% filter(category == input$category)
    }
    
    if (input$intervention != "All") {
      data <- data %>% filter(intervention == input$intervention)
    }
    
    if (input$target_population != "All") {
      data <- data %>% filter(target_population == input$target_population)
    }
    
    if (input$outcomes != "All") {
      data <- data %>% filter(outcome == input$outcomes)
    }
    
    if (input$test_name != "All") {
      data <- data %>% filter(test_name == input$test_name)
    }
    
    if (input$study_design != "All") {
      data <- data %>% filter(study_design == input$study_design)
    }
    
    if (input$test_time != "All") {
      data <- data %>% filter(test_time == input$test_time)
    }
    
    if (!is.null(input$grade) && length(input$grade) > 0) {
      data <- data %>%
        filter(sapply(strsplit(as.character(grade), ","), function(grades) {
          any(trimws(grades) %in% input$grade)
        }))
    }
    
    if (!is.null(input$rob)) {
      data <- data %>% filter(risks %in% input$rob)
    }
    
    return(data)
  })
  
  # Meta-analysis results
  MA_res <- reactive({
    data <- filtered_data()
    
    # Check if we have any data
    if (nrow(data) == 0) {
      return(NULL)
    }
    
    # Check for required columns having all NA values
    if (input$effect_type %in% c("SMD", "MD")) {
      # First check if we have pre-calculated effect sizes
      if (!all(is.na(data$effect_size)) && !all(is.na(data$variance))) {
        # Remove rows with NA or non-positive variances
        data <- data[!is.na(data$effect_size) & !is.na(data$variance) & data$variance > 0, ]
        if (nrow(data) == 0) {
          return(NULL)
        }
        
        tryCatch({
          rma(yi = effect_size, 
              vi = variance,
              method = input$ma_model,
              data = data,
              slab = paste(authors, study_year))
        }, error = function(e) {
          print(paste("Error in meta-analysis:", e$message))
          return(NULL)
        })
      } else {
        # Try calculating SMD from means and SDs if available
        if (all(is.na(data$m1i)) || all(is.na(data$sd1i)) || all(is.na(data$n1i)) ||
            all(is.na(data$m2i)) || all(is.na(data$sd2i)) || all(is.na(data$n2i))) {
          return(NULL)
        }
        # Remove rows with NA in required columns and ensure positive sample sizes
        data <- data[!is.na(data$m1i) & !is.na(data$sd1i) & !is.na(data$n1i) & 
                       !is.na(data$m2i) & !is.na(data$sd2i) & !is.na(data$n2i) &
                       data$n1i > 0 & data$n2i > 0 & data$sd1i > 0 & data$sd2i > 0, ]
        if (nrow(data) == 0) {
          return(NULL)
        }
        tryCatch({
          rma(m1i = m1i, sd1i = sd1i, n1i = n1i,
              m2i = m2i, sd2i = sd2i, n2i = n2i,
              method = input$ma_model,
              measure = case_when(
                input$effect_type == "SMD" ~ "SMD",
                input$effect_type == "MD" ~ "MD"
              ),
              data = data,
              slab = paste(authors, study_year))
        }, error = function(e) {
          print(paste("Error in meta-analysis:", e$message))
          return(NULL)
        })
      }
    } else if (input$effect_type == "OR") {
      # For OR/RR, check 2x2 table data
      if (all(is.na(data$ai)) || all(is.na(data$bi)) || 
          all(is.na(data$ci)) || all(is.na(data$di))) {
        return(NULL)
      }
      # Remove rows with NA in required columns and ensure non-zero counts
      data <- data[!is.na(data$ai) & !is.na(data$bi) & 
                     !is.na(data$ci) & !is.na(data$di) &
                     data$ai > 0 & data$bi > 0 & data$ci > 0 & data$di > 0, ]
      if (nrow(data) == 0) {
        return(NULL)
      }
      tryCatch({
        rma(ai = ai, bi = bi, ci = ci, di = di,
            method = input$ma_model,
            measure = "OR",
            data = data,
            slab = paste(authors, study_year))
      }, error = function(e) {
        print(paste("Error in meta-analysis:", e$message))
        return(NULL)
      })
    }
  })
  
  # Forest plot data
  forest_es <- reactive({
    ma <- MA_res()
    if (is.null(ma)) {
      return(NULL)
    }
    # Get the filtered data to access test_time information
    data <- filtered_data()
    
    # Extract first author surname, year, and test time
    study_labels <- sapply(seq_along(ma$slab), function(i) {
      x <- ma$slab[i]
      parts <- strsplit(as.character(x), ",")[[1]]  # Split at comma first
      author <- trimws(parts[1])  # Get first part before comma
      year <- sub(".*(\\d{4}).*", "\\1", x)  # Extract 4-digit year
      test_time_label <- if(data$test_time[i] == "1") "baseline" else "post_test"
      paste(author, year, test_time_label)  # Combine surname, year, and test time
    })
    
    data.frame(
      es = ma$yi,
      se = sqrt(ma$vi),
      study = as_factor(study_labels),
      lo.ci = ma$yi - qnorm(1-(input$conf/2)) * sqrt(ma$vi),
      up.ci = ma$yi + qnorm(1-(input$conf/2)) * sqrt(ma$vi)
    )
  })
  
  # Risk of bias data
  effectsinput <- reactive({
    data <- filtered_data()
    if (is.null(data) || nrow(data) == 0) {
      return(NULL)
    }
    data.frame(
      study = paste(
        sapply(strsplit(as.character(data$authors), ","), function(x) {
          trimws(x[1])  # Take first part before comma and trim whitespace
        }),
        data$study_year,
        ifelse(data$test_time == "1", "baseline", "post_test")
      ),
      rob_either = data$risks
    )
  })
  
  # Outputs
  output$effect <- renderText({
    ma <- MA_res()
    if (is.null(ma)) {
      return("No studies found matching the selected criteria")
    }
    paste0("ES = ", round(ma$b, digits = 2),
           ", 95% CI (", round(ma$ci.lb, digits = 2),
           ", ", round(ma$ci.ub, digits = 2), ")",
           ", k = ", ma$k)
  })
  
  # forest plot   
  height <- function() {
    if (nrow(forest_es()) < 5) 
      400
    else if (nrow(forest_es()) >= 5 & nrow(forest_es()) < 15) 
      600
    else if (nrow(forest_es()) >= 15 & nrow(forest_es()) < 25) 
      850
    else if (nrow(forest_es()) >= 25) 
      950
  }
  
  output$Plot1 <- renderPlot({
    # Check if we have data
    if (is.null(forest_es()) || is.null(effectsinput())) {
      return(NULL)
    }
    
    robcol <- c("high"="maroon4", "some concern"="darkgoldenrod4", "low"="royalblue4")
    
    ggplot2::ggplot(data = forest_es(), aes(x = es, y=study,
                                            xmin = min(lo.ci) - 3, xmax = max(up.ci) + 3)) +
      scale_x_continuous(breaks = c(round(1.1*min(forest_es()$lo.ci), 0), 
                                    round(0.5*min(forest_es()$lo.ci), 0), 
                                    0, 
                                    round(MA_res()$b, 2),
                                    round(0.5*max(forest_es()$up.ci), 0), 
                                    round(1.1*max(forest_es()$up.ci), 0))) +
      geom_pointrange(aes(x = MA_res()$b, xmin = MA_res()$ci.lb, xmax = MA_res()$ci.ub), colour = "grey") + #add average effects estimate
      geom_point(aes(colour=factor(effectsinput()$rob_either))) +#add effect sizes
      geom_linerange(aes(xmin = lo.ci, xmax = up.ci, colour=factor(effectsinput()$rob_either))) + #add conf intervals
      scale_color_manual(values = robcol) +
      labs(
        x = "Effect size and CI",
        y = "Study",
        colour = "Risk of Bias",
        title = paste0("Meta Analysis of ", input$intervention)
      ) +
      theme_classic() +
      theme(axis.text = element_text(face="bold"))
  }, height = height)
  
  
  # publication bias
  output$Plot2 <- renderPlot({
    ma <- MA_res()
    if (is.null(ma)) {
      return(NULL)
    }
    funnel(ma)
  })
  
  output$regtest <- renderPrint({
    ma <- MA_res()
    if (is.null(ma) || ma$k < 10) {
      return("Egger's regression test requires at least 10 studies for meaningful results.")
    }
    regtest(ma)
  })
  
  output$hover_info2 <- renderPrint({
    ma <- MA_res()
    if (is.null(ma)) {
      return(NULL)
    }
    print(ma$slab[ma$k])
  })
  
  output$Summary <- renderUI({
    ma <- MA_res()
    if (is.null(ma)) {
      return(HTML("No results available. Please select data and run the analysis."))
    }
    
    # Interpret effect size magnitude
    e_size <- if (is.na(ma$b)) {
      "effect size could not be determined due to missing data"
    } else if (abs(ma$b) <= 0.2) {
      sprintf("small effect size that could have practical meaning. For example, this %s intervention showed a small improvement in %s, which might be meaningful for students that struggle academically",
              input$intervention,
              paste(input$outcomes, collapse = " and "))
    } else if (abs(ma$b) > 0.2 & abs(ma$b) <= 0.8) {
      sprintf("moderate effect size, which suggests that %s has meaningful practical implications for %s, as long as the implementation costs don't overshadow the benefits",
              input$intervention,
              paste(input$outcomes, collapse = " and "))
    } else if (abs(ma$b) > 0.8) {
      sprintf("large effect size which shows that %s has substantial positive impact on %s, strongly justifying its implementation if feasible",
              input$intervention,
              paste(input$outcomes, collapse = " and "))
    }
    
    # Add conditional text for different effect size types
    conditional_text <- if (input$effect_type == "SMD") {
      paste0("<br><br> Hedges' g is a standardised mean difference between two groups. This means that the effect size is calculated by subtracting the mean of the ", 
             input$intervention,
             " group from the mean of the control group, and then dividing by the standard deviation of the control group. This approach allows us to compare the effectiveness of interventions that have slightly different components and outcomes that are not measured in exactly the same way. 
                   Common interpretations of magnitude of this effect is: small effect size (g = 0.2), moderate (0.5), and large (> 0.8).
                   <br><br> These are rough guidelines, and should usually be interpreted in context of other variables. The effect size in this meta-analysis g = ",
             if(is.na(ma$b)) "NA" else round(ma$b, digits = 3), " could be interpreted as a ", e_size, ". <br><br> Note that the sign of the effect implies direction, with the negative sign implying worse performance by the intervention group, and positive a better performance for the intervention group.")
    } else if (input$effect_type == "MD") {
      paste0("<br><br> Mean difference, is a nonstandardised (raw) mean difference between two groups, which is calculated by simply subtracting the mean value of the intervention group from the mean of the control group. This difference is the easiest to interpret (for example, the mean score on a test was 4.5 for the intervention group and 3.8 for the control group). However, we often do not compare results from the same tests across different studies, therefore we cannot directly compare nonstandardized mean differences.")
    }
    
    # Construct full summary text with NA checks
    text <- paste0(
      "This meta-analysis was conducted using the ",
      strong(ma$method),
      " tau estimator, and the average effect of the intervention was ",
      strong(if (is.na(ma$b)) "NA" else round(ma$b, digits = 2)),
      ", ",
      strong((1-input$conf)*100),
      "% CI [ ",
      strong(if (is.na(ma$ci.lb)) "NA" else round(ma$ci.lb, digits = 2)),
      ", ",
      strong(if (is.na(ma$ci.ub)) "NA" else round(ma$ci.ub, digits = 2)),
      " ]. Total variance was tau\u00B2 = ",
      strong(if (is.na(ma$tau2)) "NA" else round(ma$tau2, digits = 2)),
      " (SD of the true effects across studies was tau = ",
      strong(if (is.na(ma$tau2)) "NA" else round(sqrt(ma$tau2), digits = 2)),
      "), and the heterogeneity was I\u00B2 = ",
      strong(if (is.na(ma$I2)) "NA" else round(ma$I2, digits = 2)),
      "%. <br><br>",
      if(!is.null(conditional_text)) conditional_text else "",
      "<br><br>",
      "This analysis was done on the studies belonging to the following subgroups: <br>",
      "Studies that implemented designs: ",
      paste(if(input$study_design == "All") "All study designs" else input$study_design, collapse = ", "), "<br>",
      "Studies that measured these outcomes: ",
      paste(if(input$outcomes == "All") "All outcomes" else input$outcomes, collapse = ", "), "<br>",
      "Studies that included participants attending these grades: ",
      paste(if(is.null(input$grade)) "All grades" else input$grade, collapse = ", "), " <br>",
      "Studies with the following risk of bias: ",
      paste(if(is.null(input$rob)) "All risk levels" else input$rob, collapse = ", "), "."
    )
    
    HTML(text)
  })
  
  output$Table <- renderTable({
    filtered_data()
  })
  
  output$download <- downloadHandler(
    filename = function() {
      paste("meta-analysis-data-", Sys.Date(), ".csv", sep="")
    },
    content = function(file) {
      write.csv(filtered_data(), file, row.names = FALSE)
    }
  )
}

# Run the app
options(shiny.host = '0.0.0.0')
shinyApp(ui = ui, server = server, options = list(port = 3939))
