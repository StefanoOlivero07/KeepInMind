# ===========================
#   1. Build
# ===========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY . ./
RUN dotnet restore KeepInMindExports.Services/KeepInMindExports.Services.csproj

RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false KeepInMindExports.Services/KeepInMindExports.Services.csproj

# ===========================
#   2. Runtime
# ===========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .
COPY KeepInMindExports.Core/Templates ./Templates

ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

ENTRYPOINT [ "dotnet", "KeepInMindExports.Services.dll" ]
