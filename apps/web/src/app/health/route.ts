export function GET() {
  return Response.json({
    status: 'ok',
    service: 'web',
    basePath: '/mohtavayab',
    version: process.env.APP_VERSION ?? 'dev',
  });
}
