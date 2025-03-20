# Open the Environment with Docker

### Prerequisites
1. Install Docker Compose: [Docker Compose Installation Guide](https://docs.docker.com/compose/install/)  

### First-Time Setup
1. In the project root directory, run:  
   docker compose build  

2. Still in the project root directory, run:  
   docker compose up  

### Regular Setup (After Initial Build)
1. In the project root directory, run:   
   docker compose up  

### Troubleshooting
If you encounter errors, try the following commands:  
- Rebuild without cache:   
  docker compose build --no-cache  

- Recreate all volumes:  
  docker compose up -V  
  
**Before running this project, copy `.env.example` to `.env` and fill in your details.**  
Run the following commands:
```sh
cp cama_backend/.env.example cama_backend/.env
cp cama_frontend/.env.example cama_frontend/.env
```
# Example environment file for backend

## File: cama_backend/.env.example
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key

---
# Example environment file for frontend

## File: cama_frontend/.env.example
VITE_API_BASE_URL=https://example.com/api
---

# Open the Environment Locally (Without Docker)

### Prerequisites ###

1. Install homebrew (package manager):  
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

2. Install python3:    
   brew install python3

3. Navigate to project directory:  
   cd eld-cama  

4. Create virtual environment:  
   python3 -m venv .venv  

5. Activate the virtual environment (This needs to be done each time you want to work on the project):  
   source .venv/bin/activate

6. Deactivate the virtual environment:  
   deactivate

### Install PostgreSQL

**Linux (Ubuntu/Debian) and macOS:**

1. **Linux**: Update package lists:  
   sudo apt update

2. Install PostgreSQL and its contrib package:
   - **Linux**: 
     sudo apt install postgresql postgresql-contrib
   - **macOS (Using Homebrew)**: 
     brew install postgresql

3. Start PostgreSQL service:
   - **Linux**: 
     sudo service postgresql start
   - **macOS**: 
     brew services start postgresql

### Set Up PostgreSQL Database

1. Access the PostgreSQL prompt:  
   psql postgres

2. Create a new database:  
   CREATE DATABASE camadb;

3. Create a new user:  
   CREATE USER camaadmin WITH PASSWORD '';

4. Grant privileges to the user on the database:  
   GRANT ALL PRIVILEGES ON DATABASE camadb TO camaadmin;

5. Exit the PostgreSQL prompt:  
   \q
Configuration using Environment Variables

Example .env file:

POSTGRES_DB=camadb
POSTGRES_USER=camaadmin
POSTGRES_PASSWORD=
POSTGRES_HOST=db
POSTGRES_PORT=5432
---

### Steps to Set Up the Environment Locally

1. In the project root, create a virtual environment:  
   python3 -m venv .venv  

2. Activate the virtual environment:  
   - **Linux/Git Bash/MacOS**: 
     source .venv/bin/activate  
   - **Windows/Powershell**:  
     .venv\Scripts\activate  

3. Install Node.js and npm (mac):  
   brew install node 

4. Navigate to the frontend directory:  
   cd cama_frontend  

5. Install frontend dependencies: 
   npm install  

6. Navigate to the backend directory:  
   cd ../cama_backend  

7. Install Python dependencies: 
   python3 -m pip install -r requirements.txt  

8. Start the Django server (in `cama_backend`):  
   python3 manage.py runserver  

9. Start the frontend in development mode (in `cama_frontend`):  
   cd ../cama_frontend  
   npm run dev  

---

# Running Tests

### Running Tests Locally
1. Navigate to the `cama_backend` directory:  
   cd cama_backend  

2. Run the tests:
   pytest --cov=myapi tests/  

### Running Tests and Generating an HTML Coverage Report
1. Navigate to the `cama_backend` directory:  
   cd cama_backend  

2. Run the tests and generate an HTML coverage report:  
   pytest --cov-report html:cov_html --cov-config=.coveragerc --cov=myapi tests/  

3. Open the newly created `cov_html` folder and view `index.html` to inspect the coverage and see what needs further testing.  

--- 

# Project Structure
.
├── .gitignore
├── README.md
├── LICENSE.txt
├── cama_backend
│   ├── .coveragerc
│   ├── Dockerfile
│   ├── cama_backend
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── coverage.py
│   ├── manage.py
│   ├── myapi
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── auth_backends.py
│   │   ├── authentication.py
│   │   ├── camauser.py
│   │   ├── country.py
│   │   ├── datareciever.py
│   │   ├── decorators.py
│   │   ├── effect.py
│   │   ├── experiment.py
│   │   ├── fields.py
│   │   ├── jwt_utils.py
│   │   ├── management
│   │   │   ├── commands
│   │   │   │   ├── create_groups.py
│   │   │   │   ├── create_mock_data.py
│   │   │   │   └── delete_user.py
│   │   │   └── utils.py
│   │   ├── models.py
│   │   ├── populate_options.py
│   │   ├── serializers
│   │   │   ├── __init__.py
│   │   │   ├── cama_user.py
│   │   │   ├── effect.py
│   │   │   ├── experiment.py
│   │   │   └── study.py
│   │   ├── study.py
│   │   ├── templates
│   │   │   ├── 400.html
│   │   │   ├── 403.html
│   │   │   ├── 404.html
│   │   │   └── 500.html
│   │   ├── urls.py
│   │   ├── utils.py
│   │   └── views.py
│   ├── pytest.ini
│   ├── requirements.txt
│   └── wait-for-db.sh
├── cama_frontend
│   ├── .dockerignore
│   ├── .eslintrc.cjs
│   ├── Dockerfile
│   ├── README.md
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── public
│   │   └── vite.svg
│   ├── src
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── aboutText.json
│   │   ├── api
│   │   │   ├── adminAPI.ts
│   │   │   ├── apiClient.ts
│   │   │   ├── apiConfig.ts
│   │   │   ├── authAPI.ts
│   │   │   ├── dataAPI.ts
│   │   │   ├── newTypes.ts
│   │   │   └── types.ts
│   │   ├── assets
│   │   │   ├── countries.json
│   │   │   ├── images
│   │   │   └── react.svg
│   │   ├── components
│   │   │   ├── AdminRoute.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ListViewCard.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── OrcidCallback.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── _tests_
│   │   │   │   └── .gitkeep
│   │   │   ├── downloadFilteredData.tsx
│   │   │   ├── form
│   │   │   │   └── .gitkeep
│   │   │   └── ui
│   │   │       └── .gitkeep
│   │   ├── context
│   │   │   ├── _tests_
│   │   │   │   └── .gitkeep
│   │   │   └── authContext.tsx
│   │   ├── hooks
│   │   │   ├── _tests_
│   │   │   │   └── .gitkeep
│   │   │   ├── useAuth.ts
│   │   │   └── useAuth.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   ├── Admin
│   │   │   │   ├── AdminPage.tsx
│   │   │   │   └── ApprovalCard.tsx
│   │   │   ├── Apps
│   │   │   │   └── ShinyAppsPage.tsx
│   │   │   ├── Database
│   │   │   │   ├── DatabaseDetail.tsx
│   │   │   │   ├── DatabasePage.tsx
│   │   │   │   ├── GetImage.tsx
│   │   │   │   └── StudyCard.tsx
│   │   │   ├── FooterPages
│   │   │   │   ├── AboutPage.tsx
│   │   │   │   ├── AppPage.tsx
│   │   │   ├── Home
│   │   │   │   └── HomePage.tsx
│   │   │   ├── Login
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── Profile
│   │   │   │   └── Profile.tsx
│   │   │   ├── Subjects
│   │   │   │   └── SubjectsPage.tsx
│   │   │   ├── Upload
│   │   │   │   ├── UploadPage.tsx
│   │   │   │   ├── addEffectDialog.tsx
│   │   │   │   ├── addExperimentDialog.tsx
│   │   │   │   ├── effectFields.ts
│   │   │   │   ├── effect_form.tsx
│   │   │   │   ├── experimentFields.ts
│   │   │   │   ├── experiment_form.tsx
│   │   │   │   ├── searchDialog.tsx
│   │   │   │   └── study_form.tsx
│   │   │   └── _tests_
│   │   │       └── .gitkeep
│   │   ├── types
│   │   │   ├── auth.ts
│   │   │   └── formFieldTypes.ts
│   │   ├── utils
│   │   │   └── _tests_
│   │   │       └── .gitkeep
│   │   └── vite-env.d.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── hello_world.py
├── package-lock.json
├── package.json
└── shiny_app
    ├── Dockerfile
    ├── app.R
    ├── app_bayesian.R
    ├── curl_studies_all.txt
    ├── effect_structure.txt
    ├── experiment_structure.txt
    ├── install_packages.R
    ├── run_app.sh
    └── study_structure.txt

