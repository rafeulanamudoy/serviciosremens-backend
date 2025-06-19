import { Response, Request } from "express";
import catchAsync from "../../../shared/catchAsync";

import { jobService } from "./job.service";

import eventEmitter from "../../../sse/eventEmitter";
import { sseConnections } from "../../../sse/sseUser";
import sendResponse from "../../../shared/sendResponse";

const getTechnicionIncomingJob = catchAsync(
  async (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Catche-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    if (!sseConnections[req.user.id]) {
      sseConnections[req.user.id] = [];
    }

    sseConnections[req.user.id].push(res);

    res.write(`event: connected\ndata:"SSE connected \n\n`);

    try {
      const userId = req.user.id;

      let { page = 1, limit = 10 } = req.query;

      page = Number(page);
      limit = Number(limit);

      const sendData = async (status: string = "incoming") => {
        try {
          const result = await jobService.getIncomingJob(
            userId,
            page,
            limit,
            ""
          );
          res.write(
            `event:technicion-job\ndata: ${JSON.stringify(result)}\n\n`
          );
        } catch (error) {
          // console.log(error,"check error")
          res.write(
            `event: error\ndata: ${JSON.stringify({
              message: "Failed to fetch job data",
            })}\n\n`
          );
        }
      };
      await sendData("incoming" as string);
      const eventHandler = async ({
        userId: targetUserId,
      }: {
        userId: string;
      }) => {
        if (targetUserId === req.user.id) {
          console.log(status, "check status from event handler");
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
        sseConnections[req.user.id] = [];
        res.end();
      });
    } catch (error) {
      res.write(
        `event: error\ndata: ${JSON.stringify({
          message: "Unexpected SSE error",
        })}\n\n`
      );
    }
  }
);

const updateAssignJobStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { status, assignJobId } = req.body;
    const userId = req.user.id;
    const result = await jobService.updateAssignJobStatus(
      status,
      assignJobId,
      userId
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "job update successfully",
      data: result,
    });
  }
);

export const jobController = {
  getTechnicionIncomingJob,
  updateAssignJobStatus,
};
