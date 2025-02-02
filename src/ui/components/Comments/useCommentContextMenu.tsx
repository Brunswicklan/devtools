import { SerializedEditorState } from "lexical";

import ContextMenuDivider from "bvaughn-architecture-demo/components/context-menu/ContextMenuDivider";
import ContextMenuItem from "bvaughn-architecture-demo/components/context-menu/ContextMenuItem";
import useContextMenu from "bvaughn-architecture-demo/components/context-menu/useContextMenu";
import Icon from "bvaughn-architecture-demo/components/Icon";
import { setFocusRegionBeginTime, setFocusRegionEndTime } from "ui/actions/timeline";
import { useAppDispatch } from "ui/setup/hooks";
import type { Remark } from "ui/state/comments";
import { trackEvent } from "ui/utils/telemetry";

import { useConfirm } from "../shared/Confirm";

export default function useCommentContextMenu({
  deleteRemark,
  editRemark,
  remark,
  saveRemark,
  type,
}: {
  deleteRemark: () => void;
  editRemark: () => void;
  remark: Remark;
  saveRemark: (serializedEditorState: SerializedEditorState) => void;
  type: "comment" | "reply";
}) {
  const dispatch = useAppDispatch();

  const { confirmDestructive } = useConfirm();

  const publishRemark = () => {
    saveRemark(JSON.parse(remark.content));
  };

  const confirmDelete = () => {
    const deleteDescription =
      type === "comment"
        ? "Deleting this comment will permanently remove it and its replies"
        : "Deleting this comment will permanently remove it";

    confirmDestructive({
      acceptLabel: "Delete comment",
      description: `${deleteDescription}. Are you sure you want to proceed?`,
      message: type === "comment" ? "Delete comment and replies" : "Delete comment",
    }).then(async confirmed => {
      if (!confirmed) {
        return;
      }

      trackEvent("comments.delete");

      await deleteRemark();
    });
  };

  const setFocusEnd = () => {
    dispatch(setFocusRegionEndTime(remark.time, true));
  };

  const setFocusStart = () => {
    dispatch(setFocusRegionBeginTime(remark.time!, true));
  };

  const { contextMenu, onContextMenu } = useContextMenu(
    <>
      <ContextMenuItem onClick={editRemark}>Edit comment</ContextMenuItem>
      <ContextMenuItem onClick={confirmDelete}>
        {type === "comment" ? "Delete comment and replies" : "Delete comment"}
      </ContextMenuItem>
      {!remark.isPublished && (
        <ContextMenuItem onClick={publishRemark}>Publish comment</ContextMenuItem>
      )}
      <ContextMenuDivider />
      <ContextMenuItem onClick={setFocusStart}>
        <>
          <Icon type="set-focus-start" />
          Set focus start
        </>
      </ContextMenuItem>
      <ContextMenuItem onClick={setFocusEnd}>
        <>
          <Icon type="set-focus-end" />
          Set focus end
        </>
      </ContextMenuItem>
    </>
  );

  return { contextMenu, onContextMenu };
}
