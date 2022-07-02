import update from "immutability-helper";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import * as React from "react";
import { useState } from "react";
import { cast } from "./cast";
import { createNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";
import {
  DragDropContext,
  Draggable,
  Droppable,
  resetServerContext,
} from "react-beautiful-dnd";

type ActionData = {
  errors?: {
    title?: string;
    body?: string;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  resetServerContext();
  return null;
};
export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.length === 0) {
    return json<ActionData>(
      { errors: { title: "Title is required" } },
      { status: 400 }
    );
  }

  if (typeof body !== "string" || body.length === 0) {
    return json<ActionData>(
      { errors: { body: "Body is required" } },
      { status: 400 }
    );
  }

  const note = await createNote({ title, body, userId });

  return redirect(`/notes/${note.id}`);
};

export type Contestant = {
  Name: string;
  Age: number;
  Gender: string;
  Hometown: string;
  Country: string;
  Status: string;
  "Reason they tapped out": string;
  "Ref.": string;
  image: string;
};
const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const CastList = React.memo(function CastList({
  cast,
}: {
  cast: Contestant[];
}) {
  function getBadgeColor(index: number) {
    if (index === 0) {
      return "bg-amber-100 text-amber-800";
    }
    if (index === 1) {
      return "bg-zinc-100 text-zinc-800";
    }
    if (index === 2) {
      return "bg-amber-800 text-amber-100";
    }
    return "bg-blue-100 text-blue-800";
  }
  return (
    <>
      {cast.map((contestant, index: number) => (
        <Draggable
          draggableId={contestant.Name}
          index={index}
          key={contestant.Name}
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <div className="bg- flex w-full flex-row flex-wrap space-x-6 p-6 shadow-lg">
                <img
                  className="h-32 flex-shrink-0 rounded-md bg-gray-300"
                  src={`${contestant.image}`}
                  alt=""
                />
                <div className="flex-1 truncate">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-block flex-shrink-0 rounded-full  px-2 py-0.5 text-xs font-medium ${getBadgeColor(
                        index
                      )}`}
                    >
                      {(() => {
                        if (index === 0) return "1st";
                        if (index === 1) return "2nd";
                        if (index === 2) return "3rd";
                        return `${index + 1}th`;
                      })()}
                    </span>
                    <h3 className="truncate text-sm font-medium text-gray-900">
                      {contestant.Name}
                    </h3>
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {contestant.Hometown} {contestant.Country}{" "}
                    {contestant["Reason they tapped out"]}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
});

function QuoteApp() {
  const [state, setState] = useState({ cast });

  return (
    <DragDropContext
      onDragEnd={function (result) {
        if (!result.destination) {
          return;
        }

        if (result.destination.index === result.source.index) {
          return;
        }

        const cast = reorder(
          state.cast,
          result.source.index,
          result.destination.index
        );

        setState({ cast });
      }}
    >
      <Droppable droppableId="list">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <CastList cast={state.cast} />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default function NewNotePage() {
  const actionData = useActionData() as ActionData;
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);
  return <QuoteApp />;
  //       <label className="flex w-full flex-col gap-1">
  //         <span>Title: </span>
  //         <input
  //           ref={titleRef}
  //           name="title"
  //           className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
  //           aria-invalid={actionData?.errors?.title ? true : undefined}
  //           aria-errormessage={
  //             actionData?.errors?.title ? "title-error" : undefined
  //           }
  //         />
  //       </label>
  //       {actionData?.errors?.title && (
  //         <div className="pt-1 text-red-700" id="title-error">
  //           {actionData.errors.title}
  //         </div>
  //       )}
  //     </div>

  //     <div>
  //       <label className="flex w-full flex-col gap-1">
  //         <span>Body: </span>
  //         <textarea
  //           ref={bodyRef}
  //           name="body"
  //           rows={8}
  //           className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
  //           aria-invalid={actionData?.errors?.body ? true : undefined}
  //           aria-errormessage={
  //             actionData?.errors?.body ? "body-error" : undefined
  //           }
  //         />
  //       </label>
  //       {actionData?.errors?.body && (
  //         <div className="pt-1 text-red-700" id="body-error">
  //           {actionData.errors.body}
  //         </div>
  //       )}
  //     </div>

  //     <div className="text-right">
  //       <button
  //         type="submit"
  //         className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
  //       >
  //         Save
  //       </button>
  //     </div>
  //   </Form>
  // );
}
