import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/use-i18n";
import { Page, PageContent, PageHeader } from "../../components/page/page";
import { Card } from "../../components/card/card";
import ListRow, { List } from "../../components/list_row/list_row";
import "./altro_page.scss";

/**
 * Quello che non è né un movimento né un saldo: la tassonomia con cui li
 * leggi e le preferenze dell'app. Stava dentro Conti, che non c'entrava
 * niente — un conto è un posto dove ci sono dei soldi, non un menu.
 */
export default function AltroPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <Page className="more">
      <PageHeader>
        <h1 className="page-title">{t("nav_more")}</h1>
      </PageHeader>

      <PageContent>
        <Card className="more__menu">
          <List>
            <ListRow
              icon="pi pi-tags"
              iconShape="square"
              title={t("taxonomy_title")}
              meta={t("more_taxonomy_hint")}
              chevron
              onClick={() => navigate("/categories")}
            />

            <ListRow
              icon="pi pi-cog"
              iconShape="square"
              title={t("nav_settings")}
              meta={t("more_settings_hint")}
              chevron
              onClick={() => navigate("/settings")}
            />
          </List>
        </Card>
      </PageContent>
    </Page>
  );
}
