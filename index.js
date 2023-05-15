const express = require('express')
const morgan = require('morgan')
const {Model} = require('objection')
const Knex = require('knex')
const knexfilejs = require('./knexfile')
const Product = require('./src/models/Product')
const axios = require('axios')

const app = express()

app.use(morgan('dev'))
app.use(express.json())

const db = Knex(knexfilejs)

Model.knex(db)

app.get("/product/:title",async (req,res) => {
  const {
    params: {title},
   } = req
   listProducts  = Array();
   console.log("title = " + title)
   if (title != "all") {
    listProducts = await Product.query().where('title',title)
   } else {
    listProducts = await Product.query()
   }

   res.send(listProducts);

})

app.post("/products", async(req,res) => {
  let {
    body:{title,image,imageType,stock},
  } = req
  console.log(title + " " + image + " " + imageType + " " + stock)
  if (title != null && image != null && imageType != null) {
    console.log("entrée insert " + title)
    if (stock != null) {
      console.log("Stock = " + stock)
      await Product.query().insert({
        title: title,
        image:image,
        imageType:imageType,
        stock:stock
      })
    } else {
      await Product.query().insert({
        title: title,
        image:image,
        imageType:imageType,
        stock:1
      })
    }
  } else {
    res.status("500")
  }

  res.send('OK')
  
})

app.get('/populateDatabaseFromApi', async (req,res) => {

  try {
  axios.get("https://api.spoonacular.com/food/products/search?query=''&apiKey=5fb7c342b37c49309647ce807cea7385").then(async (response) => {
    insertItemsFromApi(response.data.products)
    })
  } catch (error){
    console.log(error)
    res.send('ERROR')
  }

  res.send("OK");

 

})

const insertItemsFromApi = async (listProduct) => {
  console.log("insertion")
  
  i = 1
  while (i<listProduct.length) {
    await Product.query().delete().where('title',"%" + listProduct[i].title +"%")
    const newProduct = await Product.query().insert({
      title:listProduct[i].title,
      image:listProduct[i].image,
      imageType:listProduct[i].imageType,
      stock:1
    })
    i++
  }
  return true;
}


app.listen(3001, () => console.log('Listening on : 3000'))