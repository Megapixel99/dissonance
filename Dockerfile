FROM node:14

RUN apt-get update
RUN apt-get install curl -y
RUN apt-get install libaio1 -y
RUN apt-get install python2.7 -y

WORKDIR /home/node/app

COPY package*.json ./

# Error used to be thrown if update is not run
# May/may not still be thrown
RUN npm update

RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "npm", "start"]
