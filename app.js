var redis = require('redis');
var client = redis.createClient({host : 'localhost', port : 6379});
const express = require("express");
const app = express();
app.use(express.json());
app.set('json spaces', 4);

var currentProizvodId = 0;
var currentKategorijaId = 0;
var currentDobavljacId = 0;

client.on('error',function() {
 console.log("Error in Redis");
});

//proizvod
app.post('/dodaj/proizvod', function (req, res) {
  client.hexists("kategorije", req.body.kategorija_id, function(err, kategorija){
    if(err) {
       res.status(500).send(JSON.stringify(err.message));
       res.header("Content-Type",'text/plain');
       return res.end();
    }
    if(kategorija == 0)
    {
      res.status(400).send(JSON.stringify('Kategorija ne postoji u bazi!'));
      res.header("Content-Type",'text/plain');
      return res.end();
    }
    client.hexists("dobavljaci", req.body.dobavljac_id, function(err, dobavljac){
      if(err) {
        res.status(500).send(JSON.stringify(err.message));
        res.header("Content-Type",'text/plain');
        return res.end();
      }
      if(dobavljac == 0)
      {
        res.status(400).send(JSON.stringify('Dobavljac ne postoji u bazi!'));
        res.header("Content-Type",'text/plain');
        return res.end();
      }
      client.hmset("proizvodi", currentProizvodId, JSON.stringify({
    	'ime':req.body.ime,
    	'cena':req.body.cena,
    	'kolicina':req.body.kolicina,
    	'dobavljac_id':req.body.dobavljac_id,
    	'kategorija_id':req.body.kategorija_id
    }), function(err) {
            if (err) {
              res.status(500).send(JSON.stringify('Dobavljac ne postoji u bazi!'));
              res.header("Content-Type",'text/plain');
              return res.end();
            }
            client.hget("proizvodi",currentProizvodId, function(err, value) {
              if (err) {
                res.status(500).send(JSON.stringify(err.message));
                res.header("Content-Type",'text/plain');
                return res.end();
              }
			  res.status(201).header("Content-Type",'application/json').json(JSON.parse(value));
              currentProizvodId++;
              return res.end();
            });
        });
    });
  });
});

app.get('/proizvodi', function (req, res) {
  var response = "[]";
  client.hgetall("proizvodi", function (err, value) {
    if (err) {
      res.status(500).send(JSON.stringify(err.message));
      res.header("Content-Type",'text/plain');
      return res.end();
    }
    res.status(200);
    res.header("Content-Type",'application/json');
    if(value != null) {
      response = "{"
      Object.keys(value).forEach(key => {
        response += "\""+key+"\":"+value[key]+",";
      });
      response = response.substring(0, response.length - 1) + "}";
    }
    res.json(JSON.parse(response));
    return res.end();
  });
});

app.get('/proizvod/:uid', function (req, res) {
  client.hget("proizvodi", req.params.uid, function(err, value) {
       if (err) {
         res.status(500).send(JSON.stringify(err.message));
         res.header("Content-Type",'text/plain');
         return res.end();
       }
       if(value == null){
         res.status(404);
         return res.end();
       }
       res.status(200);
       res.header("Content-Type",'application/json');
       res.json(JSON.parse(value));
       return res.end();
  });
});

app.get('/proizvod/izbrisi/:uid', function (req, res) {
  client.hdel("proizvodi", req.params.uid, function(err,reply) {
    if (err) {
      res.status(500).send(JSON.stringify(err.message));
      res.header("Content-Type",'text/plain');
      return res.end();
    }
    res.status(204);
    res.header("Content-Type",'text/plain');
    if(reply === 1) {
      res.header("Content",'Proizvod je izbrisan!');
    } else {
      res.header("Content",'Ne postoji proizvod sa zadatim Id-em!');
    }
    return res.end();
  });
});

//kategorija
app.post('/dodaj/kategorija', function (req, res) {
  client.hmset("kategorije", currentKategorijaId, JSON.stringify({'ime':req.body.ime}), function(err) {
        if (err) {
          res.status(500).send(JSON.stringify(err.message));
          res.header("Content-Type",'text/plain');
          return res.end();
        }
        client.hget("kategorije",currentKategorijaId, function(err, value) {
          if (err) {
            res.status(500).send(JSON.stringify(err.message));
            res.header("Content-Type",'text/plain');
            return res.end();
          }
          res.status(201).header("Content-Type",'application/json').json(JSON.parse(value));
          currentKategorijaId++;
          return res.end();
        });
    });
});

app.get('/kategorije', function (req, res) {
  var response = "[]";
  client.hgetall("kategorije", function(err, value) {
    if (err) {
      res.status(500).send(JSON.stringify(err.message));
      res.header("Content-Type",'text/plain');
      return res.end();
    }
    res.status(200);
    res.header("Content-Type",'application/json');
    if(value != null) {
      response = "{"
      Object.keys(value).forEach(key => {
        response += "\""+key+"\":"+value[key]+",";
      });
      response = response.substring(0, response.length - 1) + "}";
    }
    res.json(JSON.parse(response));
    return res.end();
  });
});

app.get('/kategorija/:uid', function (req, res) {
  client.hget("kategorije", req.params.uid, function(err, value) {
       if (err) {
         res.status(500).send(JSON.stringify(err.message));
         res.header("Content-Type",'text/plain');
         return res.end();
       }
       if(value == null){
         res.status(404);
         return res.end();
       }
       res.status(200);
       res.header("Content-Type",'application/json');
       res.json(JSON.parse(value));
       return res.end();
  });
});

app.get('/kategorija/izbrisi/:uid', function (req, res) {
  client.hdel("kategorije", req.params.uid,function(err,reply) {
    if (err) {
      res.status(500).send(JSON.stringify(err.message));
      res.header("Content-Type",'text/plain');
      return res.end();
    }
    res.status(204);
    res.header("Content-Type",'text/plain');
    if(reply === 1) {
      res.header("Content",'Kategorija je izbrisana!');
    } else {
      res.header("Content",'Ne postoji kategorija sa zadatim Id-em!');
    }
    return res.end();
  });
});

//dobavljač
app.post('/dodaj/dobavljac', function (req, res) {
  client.hmset("dobavljaci", currentDobavljacId, JSON.stringify({
	'ime':req.body.ime,
	'kontakt_osoba':req.body.kontakt_osoba,
	'email':req.body.email
}), function(err) {
        if (err) {
          res.status(500).send(JSON.stringify(err.message));
          res.header("Content-Type",'text/plain');
          return res.end();
        }
        client.hget("dobavljaci",currentDobavljacId, function(err, value) {
          if (err) {
            res.status(500).send(JSON.stringify(err.message));
            res.header("Content-Type",'text/plain');
            return res.end();
          }
          res.status(201).header("Content-Type",'application/json').json(JSON.parse(value));
          currentDobavljacId++;
          return res.end();
        });
    });
});

app.get('/dobavljaci', function (req, res) {
  var response = "[]";
  client.hgetall("dobavljaci", function(err, value) {
    if (err) {
      res.status(500).send(JSON.stringify(err.message));
      res.header("Content-Type",'text/plain');
      return res.end();
    }
    res.status(200);
    res.header("Content-Type",'application/json');
    if(value != null) {
      response = "{"
      Object.keys(value).forEach(key => {
        response += "\""+key+"\":"+value[key]+",";
      });
      response = response.substring(0, response.length - 1) + "}";
    }
    res.json(JSON.parse(response));
    return res.end();
  });
});

app.get('/dobavljac/:uid', function (req, res) {
  client.hget("dobavljaci", req.params.uid, function(err, value) {
       if (err) {
         res.status(500).send(JSON.stringify(err.message));
         res.header("Content-Type",'text/plain');
         return res.end();
       }
       if(value == null){
         res.status(404);
         return res.end();
       }
       res.status(200);
       res.header("Content-Type",'application/json');
       res.json(JSON.parse(value));
       return res.end();
  });
});

app.get('/dobavljac/izbrisi/:uid', function (req, res) {
  client.hdel("dobavljaci", req.params.uid, function(err,reply) {
    if (err) {
      res.status(500).send(JSON.stringify(err.message));
      res.header("Content-Type",'text/plain');
      return res.end();
    }
    res.status(204);
    res.header("Content-Type",'text/plain');
    if(reply === 1) {
      res.header("Content", 'Dobavljac je izbrisan!');
    } else {
      res.header("Content", 'Ne postoji dobavljac sa zadatim Id-em!');
    }
    return res.end();
  });
});

app.listen(3000);

//https://expressjs.com/en/starter/installing.html
//https://stackoverflow.com/questions/19696240/proper-way-to-return-json-using-node-or-express
//https://codeforgeek.com/node-js-redis-tutorial-installation-commands/
//https://www.compose.com/articles/api-caching-with-redis-and-nodejs/
