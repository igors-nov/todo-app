## Description

TODO App for basic TODO Lists creation with some additional ideas that would be useful in real use.

These are additional ideas, described as user stories which were implemented beside sent ones:

- I as a user can protect list with custom password, so that there is no need for any user accounts and anything, it is just as free tool where simple list can be created just by saving URL and password
- I as a user can decide on list permissions:
  - Option that users with URL access have view & edit access
  - Option that users with URL access have only view access
  - Option that list is only accessible by password
- I as user can only delete and freeze list by entering list password

Implementing following user stories from which were sent:

- I as a user can create to-do items, such as a grocery list
- I as another user can collaborate in real-time with user - so that we can (for example) edit our family shopping-list together
- I as a user can mark to-do items as “done” - so that I can avoid clutter and focus on things that are still pending
- I as a user can filter the to-do list and view items that were marked as done - so that I can retrospect on my prior progress
- I as a user can add sub-tasks to my to-do items - so that I could make logical groups of tasks and see their overall progress
- I as a user can make infinite nested levels of subtasks
- I as a user can add sub-descriptions of tasks in Markdown and view them as rich text while I'm not editing the descriptions
- I as a user can create multiple to-do lists where each list has it's unique URL that I can share with my friends - so that I could have separate to do lists for my groceries and work related tasks
- I as a user can change the order of tasks via drag & drop
- I as a user can move/convert subtasks to tasks via drag & drop
- I as a user can be sure that my todos will be persisted so that important information is not lost when server restarts
- I as an owner/creator of a certain to-do list can freeze/unfreeze a to-do list I've created to avoid other users from mutating it

## Project setup using Docker Compose

```bash
$ docker-compose up --build
```

After successfull start, project is now running on: http://localhost:3001

API Endpoint (if needed) is accessible on http://localhost:3000

## Project structure

Backend is built using NestJS framework.

Front-end is build using React + Vite.

For database PostgreSQL is used.

Front-end is located in project sub-folder `./client`.

## To run tests

```bash
$ npm run test
```

## Live Demo

Live running demo can be viewed here - http://161.35.18.6/
