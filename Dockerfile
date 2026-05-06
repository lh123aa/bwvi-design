FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built files
COPY dist/ ./dist/
COPY knowledge/ ./knowledge/

# BWVI CLI entry
ENTRYPOINT ["node", "/app/dist/bwvi.cjs"]
CMD ["--help"]

# MCP Server mode:
#   docker run bwvi mcp
#   docker run bwvi mcp --sse --port=3456

LABEL org.opencontainers.image.title="BWVI"
LABEL org.opencontainers.image.description="Better Way of Visual Intelligence — Agent-native design decision protocol"
LABEL org.opencontainers.image.version="0.2.1"
LABEL org.opencontainers.image.licenses="Apache-2.0"
