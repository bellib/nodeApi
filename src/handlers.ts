import { FastifyRequest, FastifyReply } from "fastify";
import { PokemonWithStats } from "models/PokemonWithStats";
const http = require("https");

export async function getPokemonByName(
  request: FastifyRequest,
  reply: FastifyReply
) {
  var name: string = request.params["name"];

  if(!name)  reply.send({}); 

  reply.headers["Accept"] = "application/json"; 

  var urlApiPokeman = `/api/v2/pokemon/`;
    urlApiPokeman += name + '/?offset=40&limit=20';
 
  httpRequest({
    host: "pokeapi.co",
    method: "GET",
    path: urlApiPokeman,
  })
    .then(function (body:PokemonWithStats) {
      computeResponse(body, reply);
      reply.send(body); 
    })
    .catch((e) => {
      reply.send(e); 
    });

}

export const computeResponse = async (response: PokemonWithStats, reply: FastifyReply) => {
 
 
  let types = response.types
    .map((type) => type.type)
    .map((type) => {
      return type.url;
    })
 
  let pokemonTypes = [];
  let pokemonTypesReq = [];

  types.forEach((element) => {
    console.log(element)
   pokemonTypesReq.push(
    httpRequest({
      host: "pokeapi.co",
      method: "GET",
      path: element.replace('https://pokeapi.co',''),
    })
   
   )
  
  });

   pokemonTypes = await Promise.all(pokemonTypesReq) ;
 

  if (pokemonTypes == undefined) throw pokemonTypes;

 
    var stats = [];

    pokemonTypes.map((pok) =>
      pok.pokemon.map((st) =>
        st.pokemon.name == response.name
          ? stats.push(response.name)
          : []
      )
    );
 

    if (stats) {
      let avg = stats.reduce((a, b) => a + b) / stats.length;
      response.averageStat = avg;
    } else {
      response.averageStat = 0;
    }
  
};

function httpRequest(params) {

  return new Promise(function (resolve, reject) {

    var req = http.request(params, function (res) {

      // reject on bad status
      if (res.statusCode < 200 || res.statusCode >= 300) {

       // return reject(new Error("statusCode=" + res.statusCode));
        return reject({});
      }
      // cumulate data
      var body = [];
      res.on("data", function (chunk) {
        body.push(chunk);
      });

      // resolve on end
      res.on("end", function () {
        try {
          body = JSON.parse(Buffer.concat(body).toString());
        } catch (e) {
          reject(e);
        }
        resolve(body);
      });

    });

    // reject on request error
    req.on("error", function (err) {
      // This is not a "Second reject", just a different sort of failure
      reject(err);
    });

    // IMPORTANT
    req.end();
  });
}
