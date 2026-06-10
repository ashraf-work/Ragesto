import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";
import { PassThrough } from "node:stream";
import { s3Client } from "./s3Services.js";

export async function fetchAndUpload({
  url,
  headers,
  key,
  bucket,
  contentType,
  onProgress,
}) {
  const resp = await axios({
    method: "GET",
    url,
    headers,
    responseType: "stream",
  });

  if (resp.status >= 400) {
    throw new Error(`Drive API error ${resp.status}`);
  }

  let size = 0;
  let downloaded = 0;
  const contentLength = Number(resp.headers["content-length"]) || 0;
  const bodyStream = new PassThrough();

  resp.data.on("data", (chunk) => {
    downloaded += chunk.length;
    onProgress?.({
      stage: "download",
      loaded: downloaded,
      total: contentLength,
    });
  });

  resp.data.on("error", (error) => bodyStream.destroy(error));
  resp.data.pipe(bodyStream);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: bodyStream,
      ContentType: contentType || resp.headers["content-type"],
    },
  });

  upload.on("httpUploadProgress", (progress) => {
    if (progress.loaded) {
      size = progress.loaded;
      onProgress?.({
        stage: "upload",
        loaded: progress.loaded,
        total: progress.total || contentLength,
      });
    }
  });

  await upload.done();

  return { key, size };
}
