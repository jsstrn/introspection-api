const express = require('express');
const router = express.Router();
const boom = require('boom');
const asyncMiddleware = require('../asyncMiddleware');
const Category = require('../models/Category');

router
  .route('/')
  .get(
    asyncMiddleware(async (req, res) => {
      const { name } = req.query;
      if (name) {
        const foundCategory = await Category.findOne({ name });
        if (!foundCategory) {
          throw boom.badData(
            `invalid category ${category} does not exist or has not been created yet`
          );
        }
        return res.status(200).send(foundCategory);
      }
      const categories = await Category.find();

      return res.status(200).send(categories);
    })
  )
  .post(
    asyncMiddleware(async (req, res) => {
      const { name } = req.body;
      const category = new Category({ name });
      await category.save();
      const categories = await Category.find();
      return res.status(201).send(categories);
    })
  );
router
  .route('/:id')
  .put(
    asyncMiddleware(async (req, res) => {
      const { id } = req.params;
      const category = await Category.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
      return res.status(202).send(category);
    })
  )
  .delete(
    asyncMiddleware(async (req, res) => {
      const { id } = req.params;
      const category = await Category.findByIdAndDelete(id);
      return res.status(200).json(category);
    })
  );

module.exports = router;
