import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBDiningCommonsMenuItemTable from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemTable";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";
import { Button } from "react-bootstrap";

export default function UCSBDiningCommonsMenuItemIndexPage() {
  const currentUser = useCurrentUser();

  const {
    data: ucsbDiningCommonsMenuItem,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/ucsb-dining-commons-menu-items/all"],
    { method: "GET", url: "/api/ucsb-dining-commons-menu-items/all" },
    // Stryker disable next-line all : don't test default value of empty list
    [],
  );

  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
      return (
        <Button
          variant="primary"
          href="/ucsb-dining-commons-menu-items/create"
          style={{ float: "right" }}
        >
          Create UCSB Dining Commons Menu Item
        </Button>
      );
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>UCSB Dining Commons Menu Items</h1>
        <UCSBDiningCommonsMenuItemTable menuItems={ucsbDiningCommonsMenuItem} currentUser={currentUser} />
      </div>
    </BasicLayout>
  );
}

