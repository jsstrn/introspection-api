# 🗄 introspection-api

This repository contains backend api for the introspection app

## Getting started

Install dependencies

```
npm install
```

Add `.env` file with the following details

```
PORT=7890
MONGODB_URI="mongodb://localhost/introspection-db"
```

Start MongoDB

```
npm run start:db -- <path-to-your-db>
```

To start the database locally, you have to include the `--dbpath`. For example, if your `dbpath` is  `~/data/db` then run this command

```
npm run start:db -- ~/data/db
```

Run linter

```
npm run lint
```

Run tests

```
npm test
```

## Checklist

- [x] Upload any file to a destination folder `public/uploads`
- [x] Save any file as Buffer object to the database
- [x] Only save `csv` files to the database
- [ ] Limit file size to 16MB and below

## Notes

- Forms must include `enctype="multipart/form-data"`
- MongoDB can store files as Buffer objects if they are less than 16MB
- For file sizes larger than 16MB, use [GridFS](https://docs.mongodb.com/manual/core/gridfs/)
- Our `csv` files are unlikely to be greater than 16MB, but we must enforce a file size limit