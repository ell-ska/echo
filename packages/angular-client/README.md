# echo angular client

[figma](https://www.figma.com/design/Ro1E6hyfAyP63Ak5uy1hlu/u06?node-id=58-758&t=M1RkPJj3ReZgW8j8-1)

## getting started

1. install dependencies with `bun i`

2. start the development server: `bun dev`

## project structure

the project uses modern Angular 19 features such as `input()` and `signals()` as well as the new syntax for `@if` and `@for`. components are created with inline html and utilizes tailwind for styling. authentication is handled through [`auth.service.ts`](./src/app/services/auth.service.ts) and the access token and refresh token is automatically attached to each request. refreshing the token is being automatically handeled with [`token.interceptor.ts`](./src/app/interceptors/token.interceptor.ts).

```
src/
├── app/
│   ├── components/          # a large variety of components used through out the app
│   ├── guards/              # route guards used in src/app.routes.ts
│   ├── interceptors/        # http interceptors for base url and authentication
│   ├── layouts/             # layout components
│   └── pages/               # all pages in the app
│   └── pipes/               # formatting for things like dates
│   └── services/            # handles database communication amongst other things
├── utils/                   # small convenient helper function
└── environments/            # environment specific configs
```
