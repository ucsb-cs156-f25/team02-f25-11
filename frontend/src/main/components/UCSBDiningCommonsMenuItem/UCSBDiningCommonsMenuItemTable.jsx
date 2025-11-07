import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/UCSBDiningCommonsMenuItemUtils";

export default function UCSBDiningCommonsMenuItemTable({ menuItems, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/ucsbdiningcommonsmenuitem/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test for query caching
  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/ucsb-dining-commons-menu-items/all"]
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      header: "id",
      accessorKey: "id"
    },
    {
      header: "Dining Commons Code",
      accessorKey: "diningCommonsCode"
    },
    {
      header: "Name",
      accessorKey: "name"
    },
    {
      header: "Station",
      accessorKey: "station"
    }
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, "UCSBDiningCommonsMenuItemTable"));
    columns.push(ButtonColumn("Delete", "danger", deleteCallback, "UCSBDiningCommonsMenuItemTable"));
  }

  return <OurTable
    data={menuItems}
    columns={columns}
    testid={"UCSBDiningCommonsMenuItemTable"}
  />;
}
