# Purpose

This repo is setup to demonstrate how you can map graphql nested queries to efficient AQL graph traversals automatically

It helps generate graphql query resolvers without writing too much boilerplate while keeping the queries cpu and memory efficient.

The dataset consists of a `departments` collection, an `employees` collection and a `payments` collection.
A `department has many employees` and an `employee has many payments`. If we want to retrieve a given department including all of its employees and their associated payments, we can do a graphql query that looks like this:

```
query {
    getDepartments(id: 'd1') {
        name
        employees {
            name
            payments {
                amount
            }
        }
    }
}
```

Given that `departments` are linked to `employees` through the `departments_employees` edge collection, and `employees` are linked to `payments` through the `employees_payments` edge collection, this query will result in a graph traversal, starting at `departments/d1` outbound with a min depth of 1 and a max depth of 2 using those 2 edge collections. Thus the query will be very efficient (it's just a graph traversal). Once we get the different nodes of the graph, we transform it into an object that fits our graphql schema.

# How to run
## Requirements:
- a running arangodb database instance
- nodejs

## Step-by-step
1. Clone the repo
2. Install the dependencies with yarn or npm
3. Import the contents of the dbdump directory with `arangoimport`
4. Run the script (you can customize ARANGO_URL and ARANGO_DATABASE through env vars)
