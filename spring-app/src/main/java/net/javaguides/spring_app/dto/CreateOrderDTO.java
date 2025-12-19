package net.javaguides.spring_app.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * DTO for creating or updating an order
 */
public class CreateOrderDTO {

    @NotBlank(message = "Client name is required")
    @Size(max = 100, message = "Client name must be at most 100 characters")
    private String clientName;

    @Size(max = 100, message = "Company name must be at most 100 characters")
    private String clientCompany;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address must be at most 255 characters")
    private String clientAddress;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must be at most 100 characters")
    private String clientCity;

    @NotBlank(message = "Postal code is required")
    @Size(max = 20, message = "Postal code must be at most 20 characters")
    private String clientPostalCode;

    @NotBlank(message = "Phone is required")
    @Size(max = 30, message = "Phone must be at most 30 characters")
    private String clientPhone;

    @Size(max = 100, message = "Email must be at most 100 characters")
    private String clientEmail;

    @Size(max = 500, message = "Notes must be at most 500 characters")
    private String notes;

    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<OrderItemDTO> items;

    // Default constructor
    public CreateOrderDTO() {
    }

    // Constructor with all fields
    public CreateOrderDTO(String clientName, String clientCompany, String clientAddress,
                         String clientCity, String clientPostalCode, String clientPhone,
                         String clientEmail, String notes, List<OrderItemDTO> items) {
        this.clientName = clientName;
        this.clientCompany = clientCompany;
        this.clientAddress = clientAddress;
        this.clientCity = clientCity;
        this.clientPostalCode = clientPostalCode;
        this.clientPhone = clientPhone;
        this.clientEmail = clientEmail;
        this.notes = notes;
        this.items = items;
    }

    // Getters and Setters
    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getClientCompany() {
        return clientCompany;
    }

    public void setClientCompany(String clientCompany) {
        this.clientCompany = clientCompany;
    }

    public String getClientAddress() {
        return clientAddress;
    }

    public void setClientAddress(String clientAddress) {
        this.clientAddress = clientAddress;
    }

    public String getClientCity() {
        return clientCity;
    }

    public void setClientCity(String clientCity) {
        this.clientCity = clientCity;
    }

    public String getClientPostalCode() {
        return clientPostalCode;
    }

    public void setClientPostalCode(String clientPostalCode) {
        this.clientPostalCode = clientPostalCode;
    }

    public String getClientPhone() {
        return clientPhone;
    }

    public void setClientPhone(String clientPhone) {
        this.clientPhone = clientPhone;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }
}
