# Formulario de Compra de Vehículos para Cooperativas

Este formulario permite a las cooperativas solicitar la compra de vehículos. Los datos se envían a un flujo de Power Automate para su procesamiento. Los datos son almacenados en una lista de SharePoint y se envía un correo electrónico de confirmación al solicitante tras guardar la solicitud.

## Technologías Utilizadas

No se utilizan frameworks como React o Angular. El formulario está construido con HTML, CSS y JavaScript puro. Los datos se manejan mediante JavaScript y se envían a Power Automate.

## Datos variables

Los datos de las cooperativas y vehículos se cargan desde archivos CSV. Estos archivos son leídos por JavaScript y los datos se muestran en el formulario.

### Datos de Cooperativas

Los datos de las cooperativas se encuentran en el archivo `data/cooperatives.csv`. Este archivo contiene el código, CUIT y nombre de cada cooperativa. El formato del archivo es el siguiente:

```csv
code;cuit;name
```

### Datos de Vehículos

Los datos de los vehículos se encuentran en el archivo `data/vehicles.csv`. Este archivo la marca, modelo y versión de cada vehículo. El formato del archivo es el siguiente:

```csv
brand;model;version
```

## Desarrolladores

El proyecto fue desarrollado por @maximogismondi en colaboración con @Regiar3dev. Cualquier contribución o mejora es bienvenida mente un pull request o issue en el repositorio.
