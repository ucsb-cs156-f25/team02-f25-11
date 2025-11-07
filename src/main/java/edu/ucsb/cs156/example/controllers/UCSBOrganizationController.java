package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.entities.UCSBOrganization;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.UCSBOrganizationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** This is a REST controller for UCSBDates */
@Tag(name = "UCSBOrganization")
@RequestMapping("/api/ucsborganization")
@RestController
@Slf4j
public class UCSBOrganizationController extends ApiController {

  @Autowired UCSBOrganizationRepository ucsbOrganizationRepository;

  /**
   * List all UCSB Organizations
   *
   * @return an iterable of UCSBOrganization
   */
  @Operation(summary = "List all organizations")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/all")
  public Iterable<UCSBOrganization> allUCSBOrganizations() {
    Iterable<UCSBOrganization> organizations = ucsbOrganizationRepository.findAll();
    return organizations;
  }

  /**
   * This method returns a single organization.
   *
   * @param orgCode code of the organization
   * @return a single organization
   */
  @Operation(summary = "Get a single organization")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("")
  public UCSBOrganization getById(@Parameter(name = "orgCode") @RequestParam String orgCode) {
    UCSBOrganization organization =
        ucsbOrganizationRepository
            .findById(orgCode)
            .orElseThrow(() -> new EntityNotFoundException(UCSBOrganization.class, orgCode));

    return organization;
  }

  /**
   * Create a new ucsb organization
   *
   * @param orgCode the code of the organization
   * @param orgTranslationShort shortened version of the organization
   * @param orgTranslation organization name
   * @param inactive if the organization is still active or not
   * @return the saved ucsbdate
   */
  @Operation(summary = "Create a new organization")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public UCSBOrganization postUCSBDate(
      @Parameter(name = "orgCode") @RequestParam String orgCode,
      @Parameter(name = "orgTranslationShort") @RequestParam String orgTranslationShort,
      @Parameter(name = "orgTranslation") @RequestParam String orgTranslation,
      @Parameter(name = "inactive") @RequestParam boolean inactive) {

    UCSBOrganization ucsbOrganization = new UCSBOrganization();
    ucsbOrganization.setOrgCode(orgCode);
    ucsbOrganization.setOrgTranslationShort(orgTranslationShort);
    ucsbOrganization.setOrgTranslation(orgTranslation);
    ucsbOrganization.setInactive(inactive);

    UCSBOrganization savedUcsbOrganization = ucsbOrganizationRepository.save(ucsbOrganization);

    return savedUcsbOrganization;
  }

  /**
   * Delete an organization. Accessible only to users with the role "ROLE_ADMIN".
   *
   * @param orgCode code of the organization
   * @return a message indiciating the commons was deleted
   */
  @Operation(summary = "Delete an organization")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("")
  public Object deleteCommons(@Parameter(name = "orgCode") @RequestParam String orgCode) {
    UCSBOrganization organization =
        ucsbOrganizationRepository
            .findById(orgCode)
            .orElseThrow(() -> new EntityNotFoundException(UCSBOrganization.class, orgCode));
    ucsbOrganizationRepository.delete(organization);
    return genericMessage("UCSBOrganization with id %s deleted".formatted(orgCode));
  }

  /**
   * Update a single organization. Accessible only to users with the role "ROLE_ADMIN".
   *
   * @param orgCode code of the organization
   * @param incoming the new organization contents
   * @return the updated organization object
   */
  @Operation(summary = "Update a single organization")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PutMapping("")
  public UCSBOrganization updateOrganization(
      @Parameter(name = "orgCode") @RequestParam String orgCode,
      @RequestBody @Valid UCSBOrganization incoming) {

    UCSBOrganization organization =
        ucsbOrganizationRepository
            .findById(orgCode)
            .orElseThrow(() -> new EntityNotFoundException(UCSBOrganization.class, orgCode));

    organization.setOrgTranslationShort(incoming.getOrgTranslationShort());
    organization.setOrgTranslation(incoming.getOrgTranslation());
    organization.setInactive(incoming.getInactive());

    ucsbOrganizationRepository.save(organization);

    return organization;
  }
}
