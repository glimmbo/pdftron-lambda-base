FROM public.ecr.aws/lambda/nodejs:20-arm64 as deps

COPY . .

# required for PDFTron Convert class, see https://community.apryse.com/t/cant-create-blank-pdf-pdfworkererror/7332/5?u=mark.glimm
RUN dnf install -y glibc-langpack-en

RUN npm i typescript @types/node  --save-dev
RUN npm run build

FROM deps as runner

WORKDIR /var/task

COPY --chown=node:node --from=deps /var/task/node_modules ./node_modules
COPY --chown=node:node --from=deps /var/task/dist .
COPY --chown=node:node --from=deps /var/task/package.json .

RUN npm ci --omit=dev

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "index.handler" ]
