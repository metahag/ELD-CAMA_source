# Use the official R Shiny image from Docker Hub
FROM rocker/shiny:latest

# Set the working directory
WORKDIR /srv/shiny-server

# Install essential system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install pak and all R packages (including teal) in one RUN command
RUN R -e "install.packages('pak', repos='https://r-lib.github.io/p/pak/dev/')"

RUN R -e "pak::pak(c(\
    'shiny', \
    'DBI', \
    'RPostgres', \
    'dplyr', \
    'metafor', \
    'tidyverse', \
    'brms', \
    'tidybayes', \
    'ggridges', \
    'glue', \
    'ggdist', \
    'shinyjs', \
    'bslib', \
    'insightsengineering/teal@*release', \
    'BH', \
    'RcppEigen' \
))"

# Copy the Shiny app to the container
COPY . .

# Expose both possible ports
EXPOSE 8788 8789
