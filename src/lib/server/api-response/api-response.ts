export class ApiResponse {
  static success<T>(data: T, message = "Success", status = 200) {
    return Response.json(
      {
        success: true,
        message,
        data,
      },
      { status }
    );
  }

  static error(message = "Internal Server Error", status = 500, error?: unknown) {
    return Response.json(
      {
        success: false,
        message,
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status }
    );
  }
}
