import {Application, Router, Client} from "./deps.ts"

const client = await new Client().connect({
  hostname: Deno.env.get('DB_HOSTNAME'),
  db: Deno.env.get('DB_DATABASE'),
  username: Deno.env.get('DB_USERNAME'),
  password: Deno.env.get('DB_PASSWORD'),
});

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = 'up';
  })
  .get("/employees", async (context) => {
    const employees = await client.query(`select * from employees`);

    context.response.body = employees;
  })
  .get("/employees/:id", async (context) => {
    if (context.params && context.params.id) {
      const employee = await client.query(
        "select * from employees where id = ?",
        [context.params.id]
      );
      if (employee.length === 0) {
        context.response.status = 404;   
      }
     
      context.response.body = employee[0];
    }
  });

await client.close();

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 1993 });