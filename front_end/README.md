# Stack Shop Frontend

Responsive vanilla HTML/CSS/JavaScript frontend for the supplied Node.js/Express API.

## Folder structure

```text
front end/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    └── app.js
```

## Backend expected

The frontend assumes the API is running at:

`http://localhost:4000`

Routes used:

- `POST /user/signup`
- `POST /user/signin`
- `GET /product`
- `POST /product/add`
- `DELETE /product/remove`
- `PUT /product/update`
- `POST /cart/add`
- `GET /cart/add/:id`
- `DELETE /cart/remove`
- `PUT /cart/update`

## Important cart note

The supplied routes do **not** include a normal `GET /cart` endpoint.

Because of that, this frontend:
1. Sends add/remove/update actions to your backend.
2. Stores the current cart's product IDs, quantities, and product snapshots in `localStorage`.
3. Renders the cart from that local cache.

Your backend's `GET /cart/add/:id` can be used later if you want the cart to be hydrated from the server after login.

A better backend API would eventually have:

```http
GET /cart
```

returning the authenticated user's complete cart.

## Running it

1. Put this folder inside your backend's `front end` directory.
2. Start your Express server:

```bash
npm run dev
```

3. Open the frontend through your Express static route, for example:

```text
http://localhost:4000/
```

Do not open the HTML with `file:///...` if your browser blocks CORS requests.

## JWT

After `/user/signin`, the frontend looks for one of:

```js
data.token
data.accessToken
data.jwt
```

If found, it stores the token and sends:

```http
Authorization: Bearer YOUR_TOKEN
```

on subsequent API requests.

If your signin response uses a different property name, change the `const token = ...` line in `js/app.js`.

## Product images

Your supplied product API fields did not specify an image property. The UI therefore supports these common fields if your backend returns them:

- `image`
- `imageUrl`
- `img`

Without an image, the product card displays the first letter of the product title.

## Currency

The frontend currently displays prices in Nigerian Naira using:

```js
currency: "NGN"
```

Change `formatPrice()` in `js/app.js` if your backend stores another currency.

## Product update/remove

The supplied API supports update and delete routes, but the requested UI only requires adding products from the catalog. If you want admin-style edit/delete controls, connect them to:

```http
PUT /product/update
DELETE /product/remove
```

using:

```json
{ "productId": "..." }
```

and the relevant update fields.
