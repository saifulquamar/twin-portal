# =====================================================================
# Mutanex My Twin Portal - Google Cloud Run One-Click Deployment Script
# =====================================================================

param (
    [string]$ProjectId = "",
    [string]$Region = "us-central1",
    [string]$ServiceName = "mutanex-portal",
    [string]$GeminiApiKey = ""
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      Mutanex My Twin Portal - Google Cloud Run Deploy     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check if gcloud is installed and available
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "`n[ERROR] Google Cloud SDK ('gcloud') is not found in your PATH." -ForegroundColor Red
    Write-Host "`nYou have two easy options:" -ForegroundColor Yellow
    Write-Host "  Option A (Recommended - No installation required):" -ForegroundColor White
    Write-Host "    Open Google Cloud Shell in your browser: https://shell.cloud.google.com"
    Write-Host "    Upload this project folder, and run: ./deploy_cloud_run.sh"
    Write-Host ""
    Write-Host "  Option B (Install locally):" -ForegroundColor White
    Write-Host "    Download & install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    Write-Host "    Then run 'gcloud init' to log in, and re-run this script."
    exit 1
}

# 2. Configure Google Cloud Project
if ($ProjectId -eq "") {
    $currentProject = (gcloud config get-value project 2>$null)
    if ($currentProject -and $currentProject -ne "(unset)") {
        $ProjectId = $currentProject
        Write-Host "Using currently active GCP project: $ProjectId" -ForegroundColor Green
    } else {
        $ProjectId = Read-Host "Enter your Google Cloud Project ID"
        if ($ProjectId -eq "") {
            Write-Host "[ERROR] Project ID is required." -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host "Setting project to '$ProjectId'..." -ForegroundColor Green
gcloud config set project $ProjectId

# 3. Enable necessary Google Cloud APIs
Write-Host "`nEnabling Cloud Run and Cloud Build APIs (one-time setup)..." -ForegroundColor Green
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 4. Deploy to Google Cloud Run
Write-Host "`nDeploying '$ServiceName' to Google Cloud Run in region '$Region'..." -ForegroundColor Green
Write-Host "Cloud Build will package and containerize your application in the cloud..." -ForegroundColor Gray

$deployArgs = @(
    "run", "deploy", $ServiceName,
    "--source", ".",
    "--region", $Region,
    "--platform", "managed",
    "--allow-unauthenticated"
)

if ($GeminiApiKey -ne "") {
    $deployArgs += "--set-env-vars"
    $deployArgs += "GEMINI_API_KEY=$GeminiApiKey"
}

& gcloud @deployArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Your Mutanex Twin Portal is now live on Cloud Run! " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] Deployment failed. Please review the output above." -ForegroundColor Red
}
