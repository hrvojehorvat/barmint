#!/usr/bin/env bash
# =============================================================================
# BarMint (barmint.mrvoje.com) → its own Azure Static Web App (Free plan)
# The portfolio (mrvoje.com) has its own app and script: repo hrvojehorvat/mrvoje.
#
# Meant to be run STEP BY STEP: copy each block into your terminal and check
# its output before going on.
#
# What you end up with:
#   - Resource group  barmint-rg  (West Europe)
#   - Static Web App  barmint     (East US 2, Free plan, €0/month)
#   - GitHub secret with the deploy token
#   - GitHub Actions: every push to main → lint, tests → build → deploy
#   - Custom domain barmint.mrvoje.com
# The subscription-wide budget alert is set up by the portfolio's script (mrvoje-budget).
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

RG="barmint-rg"
APP="barmint"
LOCATION="westeurope"            # resource group (only metadata)
APP_LOCATION="eastus2"           # Free plan regions: westeurope, centralus, eastus2, westus2, eastasia
REPO="hrvojehorvat/barmint"
DOMAIN="barmint.mrvoje.com"

# STEP 1 — Log in (Microsoft.Web is already registered for the subscription)
az login
az account show --query "{name:name, state:state}" -o table

# STEP 2 — Resource group and Static Web App on the FREE plan
az group create --name "$RG" --location "$LOCATION" -o table
az staticwebapp create --name "$APP" --resource-group "$RG" --location "$APP_LOCATION" --sku Free -o table
az staticwebapp show -n "$APP" -g "$RG" --query sku.name -o tsv     # MUST print "Free"

# STEP 3 — Deploy token into GitHub (piped, never printed)
az staticwebapp secrets list -n "$APP" -g "$RG" --query properties.apiKey -o tsv \
  | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --repo "$REPO"

# STEP 4 — First deploy (or just push to main)
gh workflow run deploy.yml --repo "$REPO" --ref main

# STEP 5 [MANUAL] — Cloudflare DNS: CNAME  barmint → <this address>, "DNS only" (grey cloud)
az staticwebapp show -n "$APP" -g "$RG" --query defaultHostname -o tsv

# STEP 6 — Custom domain (validated through the CNAME; HTTPS is automatic, takes a few minutes)
az staticwebapp hostname set -n "$APP" -g "$RG" --hostname "$DOMAIN"
curl -sI "https://$DOMAIN" | grep -iE "^HTTP|content-security-policy"

# Remove everything (deletes the app):
#   az group delete --name "$RG" --yes
