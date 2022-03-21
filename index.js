require("dotenv").config();  //env -> 코드상에 타이핑하지 않을 외부 변수 

const typeDefs = require("./gql/gql_schemas");
const resolvers = require("./gql/resolvers");

const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("./auth/jwt_login");
const schedule = require("./Schedule/schedule");

const {
    ApolloServer
} = require("apollo-server-express");


const SERVICE_PORT = process.env.servicePort || 54001;

const server = new ApolloServer({ // for https
    typeDefs,
    resolvers,
    playground: true,
    context: async ({
      req
    }) => {

      try {
        const ip =
        req.headers["cf-connecting-ip"] ||
        req.headers["x-real-ip"] ||
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress;
        // console.log(ip);

        let user = {
          CorpId: null,
          userId: null,
          ip: null,
        };
        // console.log(req.body.OperationName)
        if ((req.body.query.indexOf("login(") == -1 )) {
          user = await jwt.getAuth(req);
        }
     
        user.ip = ip;
        return {
          user
        };
 
      } catch (err) {
     
        throw err;
      } finally {
        // apollo.applyMiddleware({ // for http
        //   app
        // });
 
      }
    },

  });

  
app.use(express.json({
  limit: "50mb"
}));
app.use(cors());
server.applyMiddleware({ app });

app.listen({ port: SERVICE_PORT }, process.env.serverIP, () =>{
  console.log(`Now browse to http://${process.env.serverIP}:`+SERVICE_PORT+ server.graphqlPath);
  schedule.batchSchedule();
  }
);

process.on('uncaughtException', (err)=>{
  console.log('uncaughtException: ', err);
});

 