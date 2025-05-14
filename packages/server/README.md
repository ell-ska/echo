# echo server

# getting started

1. create an `.env` file following [`.env.example`](.env.example)

2. (optionally) build and start the docker container with a local mongodb instance with `docker compose up -d`

3. install dependencies with `bun i`

4. start the development server: `bun dev`

# api reference

## introduction

the echo api is organized around rest and has predictable resource oriented urls, returns json responses, and uses standard http response codes, authentication, and verbs.

## base urls

### local

`http://localhost:PORT/`

### production

`https://echo-ljzf.onrender.com`

## authentication

echo uses jwt authentication with refresh tokens to securely manage user sessions

### flow

#### login

- client sends login credentials to the login endpoint
- a jwt access token and a refresh token are issued upon successful authentication

#### using the access token

- client must include the bearer token in the authorization header when making requests to protected endpoints

#### token expiration and refreshing

- when the access token expires, the client can use the refresh token to request a new one
- refresh tokens are long lived and and stored securely in an http only cookie and in the database

#### logging out

- making an authenticated request to the logout endpoint will delete the refresh token, both in the cookie and the database

### possible errors

see [authentication errors](#authentication-errors)

## errors

echo uses conventional http response codes to indicate the success or failure of a request. all error responses include a status code and a human readable message

### authentication errors

| status code | message                           | description                                              |
| ----------- | --------------------------------- | -------------------------------------------------------- |
| 401         | access token missing              | no access token was attached to the authorization header |
| 401         | invalid access token (or similar) | the decoding of the access token failed                  |
| 401         | malformed access token            | the access token did not follow the expected shape       |
| 404         | user does not exist               | the user connected to the access token no longer exists  |

### validation errors

| status code | message                       | description                                      |
| ----------- | ----------------------------- | ------------------------------------------------ |
| 400         | array of formatted zod errors | the user input did not follow the expected shape |

### general errors

| status code | message              | description                                                      |
| ----------- | -------------------- | ---------------------------------------------------------------- |
| 500         | something went wrong | this error is very rare and will only show for unexpected errors |

## endpoints

- [capsules](#capsules)
  - [get public capsules](#get-capsulespublic)
  - [get current users capsules](#get-capsulesme)
  - [get specific capsule](#get-capsulesid)
  - [get capsule image](#get-capsulesidimagesname)
  - [create capsule](#post-capsules)
  - [edit specific capsule](#put-capsulesid)
  - [delete specific capsule](#delete-capsulesid)
- [auth](#auth)
  - [register account](#post-authregister)
  - [log in](#post-authlog-in)
  - [log out](#delete-authlog-out)
  - [refresh token](#post-tokenrefresh)
- [users](#users)
  - [get current user](#get-usersme)
  - [get specific user](#get-usersid)
  - [get current users image](#get-usersmeimage)
  - [get specific users image](#get-usersidimage)
  - [edit current user](#put-usersme)
  - [delete current user](#delete-usersme)

## capsules

### GET `/capsules/public`

_retrieves publicly available capsules_

#### query parameters

| parameter | type                   | description                                             |
| --------- | ---------------------- | ------------------------------------------------------- |
| type      | `'sealed' or 'opened'` | filter by capsule state                                 |
| take      | `number`               | number of capsules to return (default 10)               |
| skip      | `number`               | number of capsules to skip before returning (default 0) |

#### request example

```bash
curl --request GET \
  --url https://echo-ljzf.onrender.comcapsules/public
```

#### response example

_200: OK_

```json
[
  {
    "id": "67e661fb56ee4bfa3e4ae577",
    "visibility": "public",
    "state": "opened",
    "senders": ["67e549769a5ce42355e165f1"],
    "receivers": [],
    "title": "My message to the world",
    "content": "Hello world!",
    "images": [
      {
        "name": "67e66683177ae5782d84cf39-brandee-taylor-nbeISVWSXs8-unsplash.jpg",
        "type": "image/jpeg"
      }
    ],
    "openDate": "2024-08-04T13:20:34.877Z",
    "sealedAt": "2023-03-28T08:46:51.298Z"
  },
  {
    "id": "67e661f556ee4bfa3e4ae574",
    "visibility": "public",
    "state": "sealed",
    "senders": ["67e549769a5ce42355e165f1"],
    "receivers": [],
    "openDate": "2025-12-25T21:44:26.989Z"
  }
]
```

### GET `/capsules/me`

_retrieves capsules either sent by or received by the current user_

#### query parameters

| parameter | type                                  | description                                             |
| --------- | ------------------------------------- | ------------------------------------------------------- |
| type      | `'draft'` or `'sent'` or `'received'` | filter by capsule state                                 |
| take      | `number`                              | number of capsules to return (default 10)               |
| skip      | `number`                              | number of capsules to skip before returning (default 0) |

#### request example

```bash
curl --request GET \
  --url https://echo-ljzf.onrender.comcapsules/me \
  --header 'Authorization: bearer <access-token>'
```

#### response example

_200: OK_

```json
	{
		"id": "67e661fb56ee4bfa3e4ae577",
		"visibility": "public",
		"state": "opened",
		"senders": [
			"67e549769a5ce42355e165f1"
		],
		"receivers": [],
		"title": "Letter to My Future Self",
		"content": "Hey future me! I hope you finally learned how to cook without burning things. Stay awesome!",
		"images": [],
		"openDate": "2024-08-04T13:20:34.877Z",
		"sealedAt": "2023-03-28T08:46:51.298Z"
	},
	{
		"id": "67e661f556ee4bfa3e4ae571",
		"visibility": "private",
		"state": "sealed",
		"senders": [
			"67e549769a5ce42355e165f1"
		],
		"receivers": [
      "67e661fb56ee4bfa3e4ae57a"
    ],
		"openDate": "2025-05-27T21:37:08.805Z"
	},
	{
		"id": "67e661d356ee4bfa3e4ae56c",
		"visibility": "private",
		"state": "unsealed",
		"senders": [
			"67e549769a5ce42355e165f1"
		],
		"receivers": [],
		"showCountdown": true,
		"title": "First Day of College",
		"content": "Nervous, excited, and completely lost. I wonder if I’ll laugh at this in a few years.",
		"images": []
	}
```

### GET `/capsules/:id`

_retrieves information about a specific capsule_

#### authentication

publicly available capsules are available without authentication, for private capsules authentication is needed

#### route parameters

| parameter | type       | description                              |
| --------- | ---------- | ---------------------------------------- |
| id        | `ObjectId` | the unique mongodb `_id` for the capsule |

#### request example

```bash
curl --request GET \
  --url https://echo-ljzf.onrender.comcapsules/<id> \
  --header 'Authorization: bearer <access-token>'
```

#### response example

_200: OK_

```json
{
  "id": "67e661fb56ee4bfa3e4ae577",
  "visibility": "public",
  "state": "opened",
  "senders": ["67e549769a5ce42355e165f1"],
  "receivers": [],
  "title": "2024 Resolutions Check-In",
  "content": "Did I finally hit the gym regularly? Or did Netflix win again?",
  "images": [],
  "openDate": "2024-08-01T13:20:34.877Z",
  "sealedAt": "2024-01-01T08:46:51.298Z"
}
```

#### possible errors

| status code | message                                    |
| ----------- | ------------------------------------------ |
| 403         | you are not allowed to access this capsule |
| 404         | capsule not found                          |
| 423         | capsule is sealed and cannot be opened yet |

### GET `/capsules/:id/images/:name`

_retrieves an image connected to a capsule_

#### authentication

publicly available capsule images are available without authentication, for private capsule images authentication is needed

#### route parameters

| parameter | type       | description                              |
| --------- | ---------- | ---------------------------------------- |
| id        | `ObjectId` | the unique mongodb `_id` for the capsule |
| name      | `string`   | the unique name for the image            |

#### request example

```bash
curl --request GET \
  --url https://echo-ljzf.onrender.comcapsules/<id>/images/<image-name> \
  --header 'Authorization: bearer <access-token>'
```

#### response example

_200: OK_
[image file](./example.jpg)

#### possible errors

| status code | message                                     |
| ----------- | ------------------------------------------- |
| 403         | you are not allowed to access this image    |
| 404         | image not found                             |
| 423         | capsule is sealed, image cannot be accessed |

### POST `/capsules`

_create a new capsule_

#### authentication

authentication is required

#### headers

| header       | value               | reason                  |
| ------------ | ------------------- | ----------------------- |
| Content-Type | multipart/form-data | endpoint handles images |

#### request body

| key           | type                      | description                                                                                                                         |
| ------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| title         | `string`                  | title for the capsule                                                                                                               |
| openDate      | optional `Date`           | optional date the capsule will be opened, once this is set, the capsule is considered sealed                                        |
| showCountdown | optional `boolean`        | boolean for deciding if a countdown will be displayed, only matters if the visibility is `'public'`                                 |
| visibility    | `'public'` or `'private'` | sets the visibility of the capsule, if set to `'private'` `collaborators` and `receivers` will determine who can access the capsule |
| content       | optional `string`         | text content of the capsule                                                                                                         |
| images        | optional `File[]`         | image content of the capsule                                                                                                        |
| collaborators | optional `ObjectId[]`     | other users that are invited to edit the capsule, the current user should not be included                                           |
| receivers     | optional `ObjectId[]`     | if visibility is set to `'private'` this determines who can view the capsule when it opens                                          |

#### request example

```bash
curl --request POST \
  --url https://echo-ljzf.onrender.comcapsules \
  --header 'Authorization: bearer <access-token>' \
  --header 'Content-Type: multipart/form-data' \
  --form 'title=Biggest Secret of 2025' \
  --form openDate=2025-06-17T07:23:58.678Z \
  --form showCountdown=true \
  --form visibility=public \
  --form 'content=I will not tell anyone, but this is the year we almost adopted a pet we were not ready for!' \
  --form images=path/example.jpg \
  --form images=path/example2.jpg \
  --form 'collaborators=["67e28d5e64f4393eface5b1f"]'
```

#### response example

_201: Created_

```json
{
  "id": "67e66689177ae5782d84cfb0"
}
```

### PUT `/capsules/:id`

_edit a specific capsule_

#### authentication

authentication is required

#### headers

| header       | value               | reason                  |
| ------------ | ------------------- | ----------------------- |
| Content-Type | multipart/form-data | endpoint handles images |

#### route parameters

| key | type       | description                              |
| --- | ---------- | ---------------------------------------- |
| id  | `ObjectId` | the unique mongodb `_id` for the capsule |

#### request body

| key           | type                               | description                                                                                                                         |
| ------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| title         | optional `string`                  | title for the capsule                                                                                                               |
| openDate      | optional `Date`                    | optional date the capsule will be opened, once this is set, the capsule is considered sealed                                        |
| showCountdown | optional `boolean`                 | boolean for deciding if a countdown will be displayed, only matters if the visibility is `'public'`                                 |
| visibility    | optional `'public'` or `'private'` | sets the visibility of the capsule, if set to `'private'` `collaborators` and `receivers` will determine who can access the capsule |
| content       | optional `string`                  | text content of the capsule                                                                                                         |
| images        | optional `File[]`                  | image content of the capsule                                                                                                        |
| collaborators | optional `ObjectId[]`              | other users that are invited to edit the capsule, the current user should not be included                                           |
| receivers     | optional `ObjectId[]`              | if visibility is set to `'private'` this determines who can view the capsule when it opens                                          |

#### request example

```bash
curl --request PUT \
  --url https://echo-ljzf.onrender.comcapsules/<id> \
  --header 'Authorization: bearer <access-token>' \
  --header 'Content-Type: multipart/form-data' \
  --form openDate=2025-03-20T14:47:26.343Z
```

#### response example

_201: Success_

```json
{
  "id": "67e66689177ae5782d84cfb0"
}
```

#### possible errors

| status code | message                                  |
| ----------- | ---------------------------------------- |
| 403         | you are not allowed to edit this capsule |
| 404         | capsule not found                        |
| 423         | capsule is sealed and can not be edited  |

### DELETE `/capsules/:id`

_delete a specific capsules_

#### authentication

authentication is required

#### route parameters

| key | type       | description                              |
| --- | ---------- | ---------------------------------------- |
| id  | `ObjectId` | the unique mongodb `_id` for the capsule |

#### request example

```bash
curl --request DELETE \
  --url https://echo-ljzf.onrender.comcapsules/<id> \
  --header 'Authorization: bearer <access-token>' \
```

#### response example

_204: No Content_

#### possible errors

| status code | message                                    |
| ----------- | ------------------------------------------ |
| 403         | you are not allowed to delete this capsule |
| 404         | capsule not found                          |

## auth

### POST `/auth/register`

_register a new account_

#### headers

| header       | value               | reason                  |
| ------------ | ------------------- | ----------------------- |
| Content-Type | multipart/form-data | endpoint handles images |

#### request body

| key       | type              |
| --------- | ----------------- |
| username  | `string`          |
| firstName | optional `string` |
| lastName  | optional `string` |
| email     | `string`          |
| password  | `string`          |
| image     | optional `File`   |

#### request example

```bash
curl --request POST \
  --url https://echo-ljzf.onrender.comauth/register \
  --header 'Content-Type: multipart/form-data' \
  --form username=alexcarter \
  --form firstName=alex \
  --form lastName=carter \
  --form email=alex@carter.com \
  --form 'password=Password123!' \
  --form image=path/profile-picture.jpg
```

#### response example

_201: Created_

a refresh token is set as an http only cookie

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2U2NmQ3MWQ2OTQ0ZWU3MmYyMGNlYWIiLCJpYXQiOjE3NDMxNTQ1NDksImV4cCI6MTc0MzE1NTQ0OX0.t-jLWhzISmHsb9ErNOkSEK-njFj5bEXnrz1PzdbjbjA"
}
```

#### possible errors

| status code | message                          |
| ----------- | -------------------------------- |
| 400         | email or username already in use |

### POST `/auth/log-in`

_authenticate a user_

#### headers

| header       | value            | reason               |
| ------------ | ---------------- | -------------------- |
| Content-Type | application/json | to handle input data |

#### request body

| key      | type              |
| -------- | ----------------- |
| username | optional `string` |
| email    | optional `string` |
| password | `string`          |

#### request example

```bash
curl --request POST \
  --url https://echo-ljzf.onrender.comauth/log-in \
  --header 'Content-Type: application/json' \
  --data '{
	"username": "alexcarter",
	"password": "Password123!"
}'
```

#### response example

_200: OK_

a refresh token is set as an http only cookie

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2U2NmQ3MWQ2OTQ0ZWU3MmYyMGNlYWIiLCJpYXQiOjE3NDMxNTQ1NDksImV4cCI6MTc0MzE1NTQ0OX0.t-jLWhzISmHsb9ErNOkSEK-njFj5bEXnrz1PzdbjbjA"
}
```

#### possible errors

| status code | message                           |
| ----------- | --------------------------------- |
| 400         | wrong email, username or password |

### DELETE `/auth/log-out`

_log out a user_

#### authentication

authentication is required

#### cookies

| key          | type     | description                                                             |
| ------------ | -------- | ----------------------------------------------------------------------- |
| refreshToken | `string` | the jwt refresh token is needed to log out because it will be destroyed |

#### request example

```bash
curl --request DELETE \
  --url http://localhost:8000/auth/log-out \
  --header 'Authorization: bearer <access-token>' \
  --cookie refreshToken=<refresh-token>
```

#### response example

_204: No Content_

#### possible errors

| status code | message                          |
| ----------- | -------------------------------- |
| 401         | invalid or expired refresh token |

### POST `/token/refresh`

_request a new access token with the help of a refresh token_

#### cookies

| key          | type     | description                                               |
| ------------ | -------- | --------------------------------------------------------- |
| refreshToken | `string` | the jwt refresh token is needed to get a new access token |

#### request example

```bash
curl --request POST \
  --url https://echo-ljzf.onrender.comauth/token/refresh \
  --cookie refreshToken=<refresh-token>
```

#### response example

_200: OK_

a refresh token is set as an http only cookie

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2U2NmQ3MWQ2OTQ0ZWU3MmYyMGNlYWIiLCJpYXQiOjE3NDMxNTQ1NDksImV4cCI6MTc0MzE1NTQ0OX0.t-jLWhzISmHsb9ErNOkSEK-njFj5bEXnrz1PzdbjbjA"
}
```

#### possible errors

| status code | message                          |
| ----------- | -------------------------------- |
| 401         | invalid or expired refresh token |
| 401         | invalid refresh token            |
| 401         | malformed refresh token          |

## users

### GET `/users/me`

_retrieve information about the current user_

#### authentication

authentication is required

#### request example

```bash
curl --request GET \
  --url https://echo-ljzf.onrender.comusers/me \
  --header 'Authorization: bearer <access-token>'
```

#### response example

_200: OK_

```json
{
  "id": "67e549769a5ce42355e165f1",
  "username": "alexcarter",
  "firstName": "alex",
  "lastName": "carter",
  "email": "alex@carter.se"
}
```

### GET `/users/:id`

_retrieve public information about a specific user_

#### route parameters

| key | type       | description                              |
| --- | ---------- | ---------------------------------------- |
| id  | `ObjectId` | the unique mongodb `_id` for the capsule |

#### request example

```bash
curl --request GET \
  --url https://echo-ljzf.onrender.comusers/<id>
```

#### response example

_200: OK_

```json
{
  "id": "67e549769a5ce42355e165f1",
  "username": "alexcarter",
  "firstName": "alex",
  "lastName": "carter"
}
```

#### possible errors

| status code | message        |
| ----------- | -------------- |
| 404         | user not found |

### GET `/users/me/image`

_retrieve the current users profile picture_

#### authentication

authentication is required

#### request example

```bash
curl --request GET \
  --url https://echo-ljzf.onrender.comusers/me/image \
  --header 'Authorization: bearer <access-token>'
```

#### response example

_200: OK_
[image file](./example.jpg)

#### possible errors

| status code | message         |
| ----------- | --------------- |
| 404         | image not found |

### GET `/users/:id/image`

_retrieve a specific users profile picture_

#### route parameters

| parameter | type       | description                              |
| --------- | ---------- | ---------------------------------------- |
| id        | `ObjectId` | the unique mongodb `_id` for the capsule |

#### request example

```bash
curl --request GET \
  --url https://echo-ljzf.onrender.comusers/<id>/image \
  --header 'Authorization: bearer <access-token>'
```

#### response example

_200: OK_
[image file](./example.jpg)

#### possible errors

| status code | message         |
| ----------- | --------------- |
| 404         | user not found  |
| 404         | image not found |

### PUT `/users/me`

_edit the current user_

#### authentication

authentication is required

#### headers

| header       | value               | reason                  |
| ------------ | ------------------- | ----------------------- |
| Content-Type | multipart/form-data | endpoint handles images |

#### request body

| key       | type              |
| --------- | ----------------- |
| username  | optional `string` |
| firstName | optional `string` |
| lastName  | optional `string` |
| image     | optional `File`   |

#### request example

```bash
curl --request PUT \
  --url https://echo-ljzf.onrender.comusers/me \
  --header 'Content-Type: application/json' \
  --header 'Authorization: bearer <access-token>' \
  --form firstName=elias
```

#### response example

_204: No Content_

#### possible errors

| status code | message        |
| ----------- | -------------- |
| 400         | username taken |

### DELETE `/users/me`

_delete the current user_

#### authentication

authentication is required

#### request example

```bash
curl --request DELETE \
  --url https://echo-ljzf.onrender.comusers/me \
  --header 'Authorization: bearer <access-token>' \
```

#### response example

_204: No Content_
