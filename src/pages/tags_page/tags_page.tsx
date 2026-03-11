import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import "./tags_page.scss";
import Button from "../../components/button/button";
import { deleteTag, getTags } from "../../features/tags/api_calls";
import { Tag } from "../../features/tags/interfaces";
import { confirmPopup } from "primereact/confirmpopup";
import { useI18n } from "../../i18n/use-i18n";
import TagDialog from "../../components/dialog/tag_dialog/tag_dialog";
import { selectTagLoading, selectTagTags } from "../../features/tags/tag_slice";
import CustomCard from "../../components/custom_card/custom_card";

export default function TagsPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const TagLoading = useAppSelector(selectTagLoading);
  const tags = useAppSelector(selectTagTags);

  const [isDialogTagVisible, setIsDialogTagVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  useEffect(() => {
    dispatch(getTags());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setSelectedTag(null);
    setIsDialogTagVisible(true);
  };

  const handleOpenTagEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsDialogTagVisible(true);
  };

  const deleteObject = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    confirmPopup({
      target: event.currentTarget,
      message: t("delete_message"),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: t("yes"),
      rejectLabel: t("no"),
      accept: () => {
        dispatch(deleteTag({ id }));
      },
      reject: () => {},
    });
  };

  return (
    <>
      <div className="tag-page">
        <div className="page-header">
          <h1>
            <i
              className="pi pi-tags"
              style={{ fontSize: "1.5rem", marginRight: "0.625rem" }}
            ></i>
            {t("tags_title")}
          </h1>
        </div>

        <div className="split-wrapper">
          <section className="tag-list">
            <div className="scrollable-area">
              <div className="tag-section">
                <div className="tags-grid">
                  {tags.length > 0 ? (
                    tags.map((tag: Tag) => (
                      <CustomCard
                        key={tag.id}
                        title={tag.nome}
                        actions={
                          <div
                            className="buttons"
                            style={{ display: "flex", gap: "0.25rem" }}
                          >
                            <Button
                              className="trasparent-button"
                              icon="pi pi-pencil"
                              compact
                              onClick={() => handleOpenTagEdit(tag)}
                            />
                            <Button
                              className="trasparent-danger-button"
                              icon="pi pi-trash"
                              compact
                              onClick={(e: any) => deleteObject(e, tag.id)}
                            />
                          </div>
                        }
                      />
                    ))
                  ) : (
                    <p className="no-data">{t("no_data")}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <Button
          icon="pi pi-plus"
          className="add-tag-button"
          compact
          rounded
          onClick={handleOpenCreate}
        />

        <TagDialog
          visible={isDialogTagVisible}
          tag={selectedTag!}
          onHide={() => setIsDialogTagVisible(false)}
          loading={TagLoading}
        />
      </div>
    </>
  );
}
