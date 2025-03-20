#!/bin/bash

echo "Checking and installing required R packages..."
sudo R -e '
# Get system library path
lib_path <- .libPaths()[1]
print(paste("Installing to library path:", lib_path))

# Function to install if package is missing
install_if_missing <- function(pkg) {
    if (!require(pkg, character.only = TRUE, lib.loc = lib_path)) {
        print(paste("Installing", pkg))
        install.packages(pkg, lib = lib_path, repos="http://cran.rstudio.com/", dependencies = TRUE)
        return(TRUE)
    }
    return(FALSE)
}

# First install tidyverse separately as it has many dependencies
if (!require("tidyverse", lib.loc = lib_path)) {
    print("Installing tidyverse...")
    install.packages("tidyverse", lib = lib_path, repos="http://cran.rstudio.com/", dependencies = TRUE)
}

# Install other main packages if missing
packages <- c("shiny", "DBI", "RPostgres", "dplyr", "metafor", "bslib", "pak", 
              "brms", "tidybayes", "ggridges", "glue", "ggdist")
installed <- sapply(packages, install_if_missing)
if (any(installed)) {
    print("Installed missing packages:")
    print(packages[installed])
} else {
    print("All main packages already installed")
}

# Check and install teal if missing
if (!require("teal", lib.loc = lib_path)) {
    print("Installing teal package...")
    pak::pak("insightsengineering/teal@*release")
} else {
    print("teal package already installed")
}'

echo "Starting Shiny apps..."
# Start the frequentist app in the background
R -e "
.libPaths(c(.libPaths()[1]))
print(paste('Library paths:', paste(.libPaths(), collapse=', ')))
shiny::runApp('app.R', port = 3939, host = '0.0.0.0')
" &

# Start the Bayesian app
R -e "
.libPaths(c(.libPaths()[1]))
print(paste('Library paths:', paste(.libPaths(), collapse=', ')))
shiny::runApp('app_bayesian.R', port = 3940, host = '0.0.0.0')
"