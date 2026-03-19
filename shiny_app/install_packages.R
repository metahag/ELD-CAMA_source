# List of required packages
packages <- c(
  "shiny",
  "teal",
  "DBI",
  "RPostgres",
  "dplyr",
  "metafor",
  "tidyverse",
  "bslib"
)

# Function to install missing packages
install_if_missing <- function(package) {
  if (!require(package, character.only = TRUE)) {
    install.packages(package, repos = "https://cloud.r-project.org")
  }
}

# Install packages
sapply(packages, install_if_missing)