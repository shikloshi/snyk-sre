FROM node:10

add . .

RUN npm install

EXPOSE  3001

CMD ["node", "index.js"]
