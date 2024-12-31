import { faker } from "@faker-js/faker";

export const dynamic = "force-dynamic";

const severityOpts = [
  {
    text: "TRACE",
    number: faker.number.int({ min: 1, max: 4 }),
  },
  {
    text: "DEBUG",
    number: faker.number.int({ min: 5, max: 8 }),
  },
  {
    text: "INFO",
    number: faker.number.int({ min: 9, max: 12 }),
  },
  {
    text: "WARN",
    number: faker.number.int({ min: 13, max: 16 }),
  },
  {
    text: "ERROR",
    number: faker.number.int({ min: 17, max: 20 }),
  },
  {
    text: "FATAL",
    number: faker.number.int({ min: 21, max: 24 }),
  },
];

function makeLogRecord() {
  const severity = faker.helpers.arrayElement(severityOpts);

  return {
    id: faker.string.ulid(),
    timestamp: faker.date.recent(),
    severity_text: severity.text,
    severity_number: severity.number,
    service_name: faker.hacker.noun(),
    body: faker.git.commitMessage(),
    resource_attributes: {},
    log_attributes: {},
  };
}

export async function GET() {
  let logInterval: NodeJS.Timeout;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      logInterval = setInterval(() => {
        const logRecord = JSON.stringify(makeLogRecord());
        if (controller) controller.enqueue(encoder.encode(logRecord));
      }, 1000);

      setTimeout(() => {
        clearInterval(logInterval);
        controller.close();
      }, 20000);
    },

    cancel() {
      clearInterval(logInterval);
    },
  });

  return new Response(stream, {
    headers: {
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    },
  });
}
