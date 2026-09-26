# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Table QR destination

Table QR codes encode the URL configured by `VITE_PUBLIC_MENU_URL` with the opaque table token in a `token` query parameter. Set this to the public menu page that resolves table tokens. If it is unset, QR codes use the app origin. Existing links using `table_token` are also accepted.

When this app opens with `?token=…` or `?table_token=…`, it displays the public restaurant menu and requests it from `VITE_PUBLIC_MENU_API_URL`. The default resolver is `/api/public/menu.php?token=…`; configure the variable if the backend uses a different public endpoint.
