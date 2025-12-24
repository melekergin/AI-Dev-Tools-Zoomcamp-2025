FROM node:20-bullseye

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ARG SUPABASE_CLI_VERSION=1.200.3
RUN curl -sSL "https://github.com/supabase/cli/releases/download/v${SUPABASE_CLI_VERSION}/supabase_linux_amd64.tar.gz" \
  | tar -xz -C /usr/local/bin

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 8080 54321 54322 54323 54324

CMD ["npm", "run", "dev:all"]
