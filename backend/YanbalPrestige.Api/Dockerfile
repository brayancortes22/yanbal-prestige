# Dockerfile para ASP.NET Core 10 Web API (Yanbal Prestige)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar csproj, targets de licencia y restaurar dependencias
COPY ["YanbalPrestige.Api.csproj", "./"]
COPY ["Directory.Build.targets", "./"]
RUN dotnet restore "YanbalPrestige.Api.csproj"

# Copiar el resto del código y compilar versión Release
COPY . .
RUN dotnet publish "YanbalPrestige.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Imagen final de ejecución ligera en producción
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS="http://+:8080"
ENV DOTNET_USE_POLLING_FILE_WATCHER="true"
ENV ASPNETCORE_ENVIRONMENT="Production"
EXPOSE 8080

ENTRYPOINT ["dotnet", "YanbalPrestige.Api.dll"]
