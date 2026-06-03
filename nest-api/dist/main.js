"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.TZ = 'UTC';
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
function getLogLevels(envLevel) {
    const level = (envLevel || 'info').toLowerCase().trim();
    switch (level) {
        case 'error':
            return ['error'];
        case 'warn':
            return ['error', 'warn'];
        case 'info':
        case 'log':
            return ['error', 'warn', 'log'];
        case 'debug':
            return ['error', 'warn', 'log', 'debug'];
        case 'verbose':
            return ['error', 'warn', 'log', 'debug', 'verbose'];
        default:
            return ['error', 'warn', 'log'];
    }
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: getLogLevels(process.env.LOG_LEVEL),
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map