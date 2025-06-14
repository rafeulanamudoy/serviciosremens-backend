import { Response, Request } from "express";
import catchAsync from "../../../shared/catchAsync";

import sendResponse from "../../../shared/sendResponse";
import { jobService } from "./job.service";

import { JobStutus } from "@prisma/client";
import eventEmitter from "../../../sse/eventEmitter";
import { sseConnections } from "../../../sse/sseUser";
import { ConnectionCheckOutStartedEvent } from "mongodb";

const getTechnicionJob = catchAsync(async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Catche-Control", "no-cache");
  res.setHeader("Connection", "keep-aliver");
  res.flushHeaders();
  if (!sseConnections[req.user.id]) {
    sseConnections[req.user.id] = [];
  }

  sseConnections[req.user.id].push(res);

  res.write(`event: connected\ndata:"SSE connected \n\n`);

  try {
    const userId = req.user.id;

    let { page = 1, limit = 10, status } = req.query;

    page = Number(page);
    limit = Number(limit);

    const sendData = async (status: string ="current") => {
      try {
        const result = await jobService.getTechnicionJob(
          userId,
          page,
          limit,
          "",
          status as string
        );
        res.write(`event:technicion-job\ndata: ${JSON.stringify(result)}\n\n`);
      } catch (error) {
        res.write(
          `event: error\ndata: ${JSON.stringify({
            message: "Failed to fetch job data",
          })}\n\n`
        );
      }
    };
    await sendData(status as string);
    const eventHandler = async ({
      userId: targetUserId,
      status,
    }: {
      userId: string;
      status: string;
    }) => {
      if (targetUserId === req.user.id) {
        await sendData(status);
      }
    };
    eventEmitter.on("event:technicion-job", eventHandler);

    const heartbeat = setInterval(() => {
      res.write(`:\n\n`);
    }, 300 * 1000);

    req.on("close", () => {
      clearInterval(heartbeat);
      eventEmitter.off("event:technicion-job", eventHandler);
      res.end();
    });
  } catch (error) {
    res.write(
      `event: error\ndata: ${JSON.stringify({
        message: "Unexpected SSE error",
      })}\n\n`
    );
  }
});




export const jobController = {
  getTechnicionJob,
};
