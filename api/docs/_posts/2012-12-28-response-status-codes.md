---
title: 'Response status codes'

layout: nil
---

### Success

Successes differ from errors in that their body may not be a simple response object with a message. The headers however are consistent across all calls:

* `GET`, `PUT`, `DELETE` returns `200 OK` on success,
* `POST ` returns 201 on success,

When [logging in](#/login) for example:

```Status: 201 Created```
```{
  "token": {
    "access_token": "5ZLwlwz94d9w03323z3oItxCGonmdHoETtIrjtaOv70=",
    "expires": "5184000"
  },
  "user": {
    "facebook_id": 3871019282387,
    "name": "Justin Sacbibit"
  }
}```

### Error

Error responses are simply returning [standard HTTP error codes](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) along with some additional information:

* The body includes an object with an message (for debugging and/or display purposes),

For a call with an invalid authentication token for example:

```Status: 401 Access denied```
```{
  error: {
    message: 'Invalid access token'
  }
}```
