# simple-rank — ONE image, ONE service (slice C).
# Stage 1: build the SPA (Vite strict TS) -> wwwroot/
# Stage 2: build + publish the ASP.NET Core app, bundling wwwroot
# Stage 3: minimal aspnet runtime on 8080
# NOTE: .dockerignore excludes .env*, *.db*, wwwroot, node_modules, bin/obj —
# the image builds its own frontend and ships WITHOUT data or secrets.

FROM node:20-alpine AS build-client
WORKDIR /app

# Layer-cached dependency install
COPY package.json package-lock.json ./
RUN npm ci

# Frontend sources (index.html at root, src/, public/, vite config + tsconfig)
COPY index.html vite.config.ts tsconfig.json ./
COPY src ./src
COPY public ./public

# VITE_API_BASE_URL is BUILD-time only and must stay empty for same-origin
# serving (.env* files are dockerignored, so no absolute URL can be baked in).
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build


FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-server
WORKDIR /src

# global.json pins the SDK line (8.0.0, rollForward latestFeature)
COPY global.json ./

# Project files first -> layer-cached dotnet restore
COPY simple-rank-backend.csproj simpleRank.sln ./
RUN dotnet restore simple-rank-backend.csproj

# All C# sources + config
COPY . ./

# Put the freshly built SPA in place BEFORE publish so the Web SDK publishes
# wwwroot/ into the output (re-copied below as a guarantee anyway).
COPY --from=build-client /app/wwwroot ./wwwroot

RUN dotnet publish simple-rank-backend.csproj -c Release -o /app/publish

# Guarantee: the publish output always contains wwwroot/index.html
COPY --from=build-client /app/wwwroot /app/publish/wwwroot


FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build-server /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

# Non-root (aspnet images ship the built-in `app` user). Ownership is fixed
# first: with DatabaseProvider=Sqlite and no volume mounted, the app creates
# its (empty) SQLite file in /app at startup.
RUN chown -R app:app /app
USER app

ENTRYPOINT ["dotnet", "simple-rank-backend.dll"]