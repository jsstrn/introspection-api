# spike-csv-mongo

This spike shows how to upload `csv` files in MongoDB

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
