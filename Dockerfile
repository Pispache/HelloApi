# Use the official .NET 8.0 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o out

# Use the official .NET 8.0 runtime image for running
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy the published application
COPY --from=build /src/out .

# Expose port 8080 (default for .NET 8 in containers)
EXPOSE 8080

# Set the entry point
ENTRYPOINT ["dotnet", "HelloApi.dll"]
