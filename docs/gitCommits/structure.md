# Tipos más importantes para generar un buen commit

- feat: Nueva funcionalidad
- fix: Corrección de errores
- docs: Documentación
- style: Formato, espacios, punto y coma, etc.
- refactor: Mejorar código sin cambiar comportamiento
- test: Agregar o modificar pruebas
- chore: Tareas de mantenimiento
- perf: Mejoras de rendimiento
- build: Cambios en compilación o dependencias
- ci: Integración continua (GitHub Actions, GitLab CI, etc.)
- revert: Revertir un commit.

## Cuando un cambio rompe compatibilidad

```bash
git commit -m "feat!: cambiar estructura de la API"
```

o

```bash
git commit -m "feat(api): cambiar estructura de la API

BREAKING CHANGE: ahora los IDs son UUID"
```
