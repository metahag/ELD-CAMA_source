library(shiny)
library(brms)
library(tidybayes)
library(ggridges)
library(glue)
library(ggdist)
library(tidyverse)
library(DBI)
library(RPostgres)
library(metafor)
library(shinyjs)

# Database connection
con <- dbConnect(RPostgres::Postgres(),
                 dbname = Sys.getenv("POSTGRES_DB"),
                 host = "db",
                 port = 5432,
                 user = Sys.getenv("POSTGRES_USER"),
                 password = Sys.getenv("POSTGRES_PASSWORD")
)

##############################
ui <- fluidPage(
  useShinyjs(),
  tags$head(
    tags$style(HTML("
            #loading-content {
                position: fixed;
                top: 50px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                background-color: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                width: 80%;
                max-width: 500px;
                display: none;  /* Hide by default */
            }
            #status-message {
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                padding: 10px;
                border-radius: 5px;
                background-color: white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                font-weight: bold;
                width: 80%;
                max-width: 500px;
                text-align: center;
                display: none;  /* Hide by default */
            }
            .success-message {
                color: green;
            }
            .error-message {
                color: red;
            }
            .tab-content {
                padding-top: 20px;
            }
        ")),
    # Add JavaScript for tab switching and scrolling
    tags$script(HTML("
            $(document).ready(function() {
                // Function to scroll to show full app content
                function scrollToTabContent() {
                    // Get the main panel height
                    var mainPanelHeight = $('.tab-content').height();
                    // Get the window height
                    var windowHeight = $(window).height();
                    // Get the current scroll position
                    var currentScroll = $(window).scrollTop();
                    // Get the tab content position
                    var tabContentTop = $('.tab-content').offset().top;

                    // Calculate how much we need to scroll to show the full content
                    var scrollTo = tabContentTop - 50;  // Leave some space at the top

                    // Smooth scroll to the position
                    $('html, body').animate({
                        scrollTop: scrollTo
                    }, 300);
                }

                // Bind to tab show event
                $(document).on('shown.bs.tab', 'a[data-toggle=\"tab\"]', function (e) {
                    setTimeout(scrollToTabContent, 100);  // Small delay to ensure content is rendered
                });

                // Also bind to the go button
                $('#go').on('click', function() {
                    setTimeout(scrollToTabContent, 100);
                });

                // Hide status message after 5 seconds
                function hideStatusMessage() {
                    setTimeout(function() {
                        $('#status-message').fadeOut();
                    }, 5000);
                }

                // Observe status message changes
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList' && mutation.target.id === 'status-message') {
                            if (mutation.target.innerHTML.trim() !== '') {
                                $('#status-message').fadeIn();
                                hideStatusMessage();
                            }
                        }
                    });
                });

                observer.observe(document.getElementById('status-message'), {
                    childList: true,
                    subtree: true
                });
            });
        "))
  ),
  
  # Loading content
  div(
    id = "loading-content",
    h3("Calculating Bayesian model...", style = "color: blue;"),
    div(
      id = "progress-box",
      p("Current step: ", textOutput("current_step", inline = TRUE)),
      p("Progress: ", textOutput("progress_text", inline = TRUE)),
      p("Estimated time remaining: ", textOutput("time_remaining", inline = TRUE))
    )
  ),
  
  # Status message
  div(id = "status-message", class = "status-message"),
  
  # Application title
  titlePanel("Bayesian Meta-Analysis"),
  
  # Sidebar with inputs
  sidebarLayout(
    sidebarPanel(
      h4("Select your studies of interest"),
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
                  multiple = TRUE),
      
      h4("Define the meta-analysis"),
      selectInput("rob", 
                  label = "Select risk of bias",
                  choices = c("low", "some concern", "high", "N/A"),
                  multiple = TRUE),
      selectInput("prior",
                  label = "Choose prior for Tau\u00B2",
                  choices = c(
                    "Half-Cauchy" = "cauchy",
                    "normal" = "normal"
                  ),
                  selected = "cauchy"
      ),
      sliderInput("prior_sd_slide",
                  label = "Set \u03c3 for the tau\u00B2 distribution. Note that x_0 = 0",
                  min = 0,
                  max = 5,
                  value = 0.5,
                  step = 0.1
      ),
      selectInput("prior_es",
                  label = "Choose prior for Intercept",
                  choices = c(
                    "Cauchy" = "cauchy",
                    "normal" = "normal"
                  ),
                  selected = "normal"
      ),
      sliderInput("prior_es_sd_slide",
                  label = "Set \u03c3 for the distribution of the intercept. Note that \u03BC = 0",
                  min = 0,
                  max = 5,
                  value = 1,
                  step = 0.1
      ),
      numericInput("warmup",
                   label = "Choose number of practice iterations",
                   value = 2000,
                   min = 500,
                   max = 10000,
                   step = 500
      ),
      numericInput("iterations",
                   label = "Choose number of iterations (number can't be lower than practice iterations)",
                   value = 5000,
                   min = 1000,
                   max = 10000,
                   step = 500
      ),
      actionButton("go", "Run model")
    ),
    
    # Main panel with outputs
    mainPanel(
      tabsetPanel(
        id = "tabs",
        type = "tabs",
        tabPanel("Forest plot",
                 plotOutput("Plot_forest")
        ),
        tabPanel("Posterior distribution",
                 plotOutput("Plot_posterior")
        ),
        tabPanel("Model Diagnostics",
                 h3("Model summary"),
                 verbatimTextOutput("Summary"),
                 h3("MCMC Diagnostics"),
                 htmlOutput("model_diagnostics"),
                 h3("Trace Plots"),
                 plotOutput("diagnostics"),
                 h3("Posterior predictive distribution"),
                 plotOutput("Plot2")
        ),
        tabPanel(
          "Result Summary",
          htmlOutput("Results")
        ),
        tabPanel(
          "Table",
          tableOutput("Table")
        ),
        tabPanel(
          "Model Diagnostics Summary",
          htmlOutput("model_diagnostics")
        )
      )
    )
  )
)

##############################
server <- function(input, output, session) {
  # Add reactive values for progress tracking
  progress_vals <- reactiveValues(
    current_step = "",
    progress = 0,
    start_time = NULL,
    status_message = ""
  )
  
  # Switch to Model Diagnostics tab when Run Model is clicked
  observeEvent(input$go, {
    updateTabsetPanel(session, "tabs", selected = "Model Diagnostics")
  })
  
  # Function to update progress
  update_progress <- function(step, prog, msg = NULL) {
    progress_vals$current_step <- step
    progress_vals$progress <- prog
    if (!is.null(msg)) {
      progress_vals$status_message <- msg
      if (grepl("error", tolower(msg))) {
        shinyjs::show("status-message")
        html(id = "status-message", html = msg, add = FALSE)
        removeClass(id = "status-message", class = "success-message")
        addClass(id = "status-message", class = "error-message")
      } else {
        shinyjs::show("status-message")
        html(id = "status-message", html = msg, add = FALSE)
        removeClass(id = "status-message", class = "error-message")
        addClass(id = "status-message", class = "success-message")
      }
    }
  }
  
  # Output elements for progress tracking
  output$current_step <- renderText({
    progress_vals$current_step
  })
  
  output$progress_text <- renderText({
    paste0(round(progress_vals$progress * 100), "%")
  })
  
  output$time_remaining <- renderText({
    if (is.null(progress_vals$start_time) || progress_vals$progress == 0) {
      return("Calculating...")
    }
    
    elapsed <- as.numeric(difftime(Sys.time(), progress_vals$start_time, units = "secs"))
    if (progress_vals$progress > 0) {
      total_estimated <- elapsed / progress_vals$progress
      remaining <- total_estimated - elapsed
      if (remaining < 60) {
        return(paste(round(remaining), "seconds"))
      } else {
        return(paste(round(remaining / 60, 1), "minutes"))
      }
    }
    return("Calculating...")
  })
  
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
                   est.name as effect_size_type, ef.test_time_id as test_time, ef.outcome, ef.test_name,
                   ef.d as effect_size, ef.d_var as variance,
                   ef.m1i, ef.sd1i, ef.n1i, ef.m2i, ef.sd2i, ef.n2i,
                   ef.ai, ef.bi, ef.ci, ef.di
            FROM myapi_study s
            LEFT JOIN myapi_country c ON s.country_id = c.id
            LEFT JOIN myapi_category cat ON s.category_id = cat.id
            JOIN myapi_experiment e ON s.study_id = e.study_id_id
            LEFT JOIN myapi_studydesign sd ON e.study_design_id = sd.id
            LEFT JOIN myapi_riskofbias rob ON e.risks_id = rob.id
            JOIN myapi_effect ef ON e.experiment_nr = ef.experiment_nr_id
            JOIN myapi_effectsizetype est ON ef.effect_size_type_id = est.id
            WHERE est.name = 'SMD'
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
    
    if (input$study_design != "All") {
      data <- data %>% filter(study_design == input$study_design)
    }
    
    if (input$outcomes != "All") {
      data <- data %>% filter(outcome == input$outcomes)
    }
    
    if (input$test_name != "All") {
      data <- data %>% filter(test_name == input$test_name)
    }
    
    if (input$test_time != "All") {
      data <- data %>% filter(test_time == input$test_time)
    }
    
    # Modified grade filter to handle multiple grades in one cell
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
  
  # Calculate effect sizes
  ef <- reactive({
    data <- filtered_data()
    
    tryCatch(
      {
        if (!any(
          is.na(data$m1i), is.na(data$n1i), is.na(data$sd1i),
          is.na(data$m2i), is.na(data$sd2i), is.na(data$n2i)
        )) {
          escalc("SMD",
                 data = data,
                 m1i = m1i, n1i = n1i, sd1i = sd1i,
                 m2i = m2i, n2i = n2i, sd2i = sd2i
          )
        } else {
          # Use pre-calculated effect sizes from database
          data$yi <- data$effect_size
          data$vi <- data$variance
          data
        }
      },
      error = function(e) {
        print(paste("Error in effect size calculation:", e$message))
        return(data.frame())
      }
    )
  })
  
  # Make priors interactive
  prior <- reactive({
    c(
      prior_string(paste0(input$prior_es, "(0,", input$prior_es_sd_slide, ")"),
                   class = "Intercept"
      ),
      prior_string(paste0(input$prior, "(0,", input$prior_sd_slide, ")"),
                   class = "sd"
      )
    )
  })
  
  # Bayesian meta model
  ma <- eventReactive(input$go, {
    withProgress(message = "Fitting Bayesian model", value = 0, {
      data <- ef()
      
      if (nrow(data) == 0) {
        showNotification("Error: No data available for the selected criteria",
                         type = "error", duration = NULL
        )
        return(NULL)
      }
      
      incProgress(0.2, detail = "Setting up model...")
      
      # Increase max_treedepth to handle the warning
      model <- tryCatch(
        {
          brm(yi | se(vi) ~ 1 + (1 | study_id),
              data = data,
              prior = prior(),
              warmup = input$warmup,
              iter = input$iterations,
              chains = 4,
              control = list(max_treedepth = 15), # Increased from default 10
              refresh = 50
          )
        },
        error = function(e) {
          showNotification(paste("Error in Bayesian model:", e$message),
                           type = "error", duration = NULL
          )
          return(NULL)
        }
      )
      
      incProgress(0.9, detail = "Processing results...")
      
      if (!is.null(model)) {
        showNotification("Model fitting complete! You can now view the results.",
                         type = "message", duration = NULL
        )
      }
      
      return(model)
    })
  })
  
  # Prepare posterior samples with error handling
  post.samples <- reactive({
    req(ma()) # Ensure ma() exists and is not NULL
    
    tryCatch(
      {
        ma() %>%
          posterior::as_draws_df(., c("^b_", "^sd_"), regex = TRUE) %>%
          rename("es" = "b_Intercept", "tau" = "sd_study_id__Intercept")
      },
      error = function(e) {
        showNotification(paste("Error processing posterior samples:", e$message),
                         type = "error", duration = NULL
        )
        NULL
      }
    )
  })
  
  # Effect size of each study for the forest plot
  study.draws <- reactive({
    req(ma()) # Ensure ma() exists and is not NULL
    
    tryCatch(
      {
        tidybayes::spread_draws(ma(), r_study_id[study_id, ], b_Intercept) %>%
          mutate(
            b_Intercept = r_study_id + b_Intercept,
            study_id = as.character(study_id)
          ) # Convert to character
      },
      error = function(e) {
        showNotification(paste("Error processing study draws:", e$message),
                         type = "error", duration = NULL
        )
        NULL
      }
    )
  })
  
  # Add the effect size estimate for forest plot
  pooled.effect.draws <- reactive({
    req(ma()) # Ensure ma() exists and is not NULL
    
    tryCatch(
      {
        tidybayes::spread_draws(ma(), b_Intercept) %>%
          mutate(
            study_id = "Pooled Effect", # Already character
            study_id = factor(study_id, levels = "Pooled Effect")
          ) # Make it a factor
      },
      error = function(e) {
        showNotification(paste("Error processing pooled effects:", e$message),
                         type = "error", duration = NULL
        )
        NULL
      }
    )
  })
  
  # Bind the data for the forest plot
  forest.data <- reactive({
    req(study.draws(), pooled.effect.draws()) # Ensure both exist and are not NULL
    
    tryCatch(
      {
        # Combine the data ensuring study_id is character type
        combined_data <- bind_rows(
          study.draws() %>% mutate(study_id = as.character(study_id)),
          pooled.effect.draws()
        )
        
        # Create proper ordering
        combined_data %>%
          ungroup() %>%
          mutate(study_id = factor(study_id,
                                   levels = c(
                                     setdiff(sort(unique(study_id)), "Pooled Effect"),
                                     "Pooled Effect"
                                   )
          ))
      },
      error = function(e) {
        showNotification(paste("Error creating forest plot data:", e$message),
                         type = "error", duration = NULL
        )
        NULL
      }
    )
  })
  
  # Effect size and credible interval for each study
  forest.data.summary <- reactive({
    req(forest.data()) # Ensure forest.data() exists and is not NULL
    
    tryCatch(
      {
        group_by(forest.data(), study_id) %>%
          ggdist::mean_qi(b_Intercept)
      },
      error = function(e) {
        showNotification(paste("Error calculating summary statistics:", e$message),
                         type = "error", duration = NULL
        )
        NULL
      }
    )
  })
  
  # Dynamic plot height
  height <- function() {
    n <- nrow(ef())
    if (n < 5) {
      return(200)
    } else if (n >= 5 && n < 15) {
      return(400)
    } else if (n >= 15 && n < 25) {
      return(650)
    } else {
      return(950)
    }
  }
  
  # Posterior distribution plot
  output$Plot_posterior <- renderPlot({
    if (is.null(post.samples())) {
      return(NULL)
    }
    
    ggplot(aes(x = es), data = post.samples()) +
      geom_density(fill = "lightblue", color = "lightblue", alpha = 0.7) +
      geom_point(y = 0, x = mean(post.samples()$es)) +
      labs(
        x = expression(italic("Effect size")),
        y = element_blank()
      ) +
      theme_minimal()
  })
  
  # Forest plot
  output$Plot_forest <- renderPlot(
    {
      req(ma(), forest.data(), forest.data.summary()) # Ensure all required data exists
      
      tryCatch(
        {
          # Create the forest plot
          ggplot() +
            # Add vertical line for zero effect
            geom_vline(xintercept = 0, linetype = "dashed", color = "gray50") +
            # Add vertical line for pooled effect
            geom_vline(
              xintercept = fixef(ma())[1, 1],
              color = "gray50", linetype = "solid", alpha = 0.5
            ) +
            # Add individual study effects with CI
            geom_pointrange(
              data = forest.data.summary() %>%
                filter(study_id != "Pooled Effect"),
              aes(
                x = b_Intercept,
                y = study_id,
                xmin = .lower,
                xmax = .upper
              ),
              size = 0.5,
              shape = 15
            ) + # Use square points
            # Add pooled effect as diamond
            geom_point(
              data = forest.data.summary() %>%
                filter(study_id == "Pooled Effect"),
              aes(
                x = b_Intercept,
                y = study_id
              ),
              shape = 23, # Diamond shape
              size = 3,
              fill = "black"
            ) +
            geom_errorbarh(
              data = forest.data.summary() %>%
                filter(study_id == "Pooled Effect"),
              aes(
                x = b_Intercept,
                y = study_id,
                xmin = .lower,
                xmax = .upper
              ),
              height = 0.1
            ) +
            # Add effect size labels
            geom_text(
              data = mutate_if(
                forest.data.summary(),
                is.numeric, round, 2
              ),
              aes(
                x = max(b_Intercept) + diff(range(b_Intercept)) * 0.3,
                y = study_id,
                label = sprintf(
                  "%.2f [%.2f, %.2f]",
                  b_Intercept, .lower, .upper
                )
              ),
              hjust = 0
            ) +
            # Customize theme and labels
            scale_y_discrete(limits = rev) + # Reverse study order
            labs(
              x = "Effect Size (SMD)",
              y = "Study"
            ) +
            theme_minimal() +
            theme(
              axis.text = element_text(face = "bold"),
              panel.grid.major.y = element_blank(),
              panel.grid.minor = element_blank()
            ) +
            # Adjust plot margins to accommodate labels
            coord_cartesian(clip = "off") +
            theme(plot.margin = margin(5.5, 100, 5.5, 5.5, "points"))
        },
        error = function(e) {
          showNotification(paste("Error creating forest plot:", e$message),
                           type = "error", duration = NULL
          )
          plot(0, 0, type = "n", axes = FALSE, xlab = "", ylab = "")
          text(0, 0, paste("Error creating forest plot:", e$message), cex = 1.2)
        }
      )
    },
    height = height
  )
  
  # Results summary
  output$Results <- renderUI({
    if (is.null(post.samples())) {
      return(HTML("No results available. Please ensure you have selected data and run the model."))
    }
    
    post_samples <- post.samples()
    es_mean <- mean(post_samples$es)
    es_lower <- quantile(post_samples$es, 0.025)
    es_upper <- quantile(post_samples$es, 0.975)
    tau_mean <- mean(post_samples$tau)
    tau_lower <- quantile(post_samples$tau, 0.025)
    tau_upper <- quantile(post_samples$tau, 0.975)
    
    HTML(paste0(
      "The results show that the estimated pooled effect size is ",
      round(es_mean, 2),
      " with a 95% credible interval of [",
      round(es_lower, 2), ", ",
      round(es_upper, 2), "]. ",
      "The estimated between-study heterogeneity (tau) is ",
      round(tau_mean, 2),
      " with a 95% credible interval of [",
      round(tau_lower, 2), ", ",
      round(tau_upper, 2), "]. ",
      "A larger tau value indicates greater between-study variability in the effect sizes."
    ))
  })
  
  # Model summary
  output$Summary <- renderPrint({
    if (is.null(ma())) {
      return("No model results available. Please ensure you have selected data and run the model.")
    }
    summary(ma())
  })
  
  # Posterior predictive check
  output$Plot2 <- renderPlot({
    if (is.null(ma())) {
      return(NULL)
    }
    pp_check(ma())
  })
  
  # Data table
  output$Table <- renderTable({
    data <- ef()
    if (nrow(data) == 0) {
      return(data.frame(Message = "No data available for the selected criteria"))
    }
    data
  })
  
  # Add diagnostic plots tab
  output$diagnostics <- renderPlot({
    req(ma())
    mcmc_plot(ma(), type = "trace") +
      theme_minimal() +
      ggtitle("MCMC Trace Plots")
  })
  
  # Update the UI to include diagnostics
  output$model_diagnostics <- renderUI({
    req(ma())
    
    # Get convergence diagnostics
    diag <- rhat(ma())
    n_eff <- neff_ratio(ma())
    
    HTML(paste0(
      "<h4>Model Diagnostics:</h4>",
      "<p>Rhat values (should be < 1.1): ",
      paste(round(diag, 3), collapse = ", "),
      "</p><p>Effective sample size ratio (should be > 0.1): ",
      paste(round(n_eff, 3), collapse = ", "),
      "</p>"
    ))
  })
}

# Run the app
options(shiny.host = "0.0.0.0")
shinyApp(ui = ui, server = server, options = list(port = 3940))
