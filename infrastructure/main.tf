terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

# ล็อกอินด้วย `az login` และตั้ง ARM_SUBSCRIPTION_ID ก่อนรัน
provider "azurerm" {
  features {}
}

variable "location" {
  description = "Azure region (Azure for Students อนุญาตเฉพาะบาง region)"
  default     = "eastasia"
}

variable "ssh_public_key_path" {
  description = "ไฟล์ Public Key ที่จะใส่ใน authorized_keys ของเซิร์ฟเวอร์"
  default     = "~/.ssh/id_rsa.pub"
}

resource "azurerm_resource_group" "iot" {
  name     = "iot-api-rg"
  location = var.location
}

resource "azurerm_virtual_network" "iot" {
  name                = "iot-api-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.iot.location
  resource_group_name = azurerm_resource_group.iot.name
}

resource "azurerm_subnet" "iot" {
  name                 = "iot-api-subnet"
  resource_group_name  = azurerm_resource_group.iot.name
  virtual_network_name = azurerm_virtual_network.iot.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Public IP แบบ Static เพื่อให้ IP ไม่เปลี่ยนเมื่อปิด-เปิดเครื่อง
resource "azurerm_public_ip" "iot" {
  name                = "iot-api-ip"
  location            = azurerm_resource_group.iot.location
  resource_group_name = azurerm_resource_group.iot.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

# เปิดพอร์ต SSH (22) และ API (8888)
resource "azurerm_network_security_group" "iot" {
  name                = "iot-api-nsg"
  location            = azurerm_resource_group.iot.location
  resource_group_name = azurerm_resource_group.iot.name

  security_rule {
    name                       = "SSH"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "IoT-API"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "8888"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_network_interface" "iot" {
  name                = "iot-api-nic"
  location            = azurerm_resource_group.iot.location
  resource_group_name = azurerm_resource_group.iot.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.iot.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.iot.id
  }
}

resource "azurerm_network_interface_security_group_association" "iot" {
  network_interface_id      = azurerm_network_interface.iot.id
  network_security_group_id = azurerm_network_security_group.iot.id
}

# สร้างเซิร์ฟเวอร์ Ubuntu 22.04 ขนาด Standard_B2ats_v2 (2 vCPU, 1GB RAM)
# เป็นขนาดเล็กสุดที่ Azure for Students เปิดให้ใช้ใน eastasia (ไม่มี Standard_B1s)
resource "azurerm_linux_virtual_machine" "iot_server" {
  name                  = "iot-api-server"
  location              = azurerm_resource_group.iot.location
  resource_group_name   = azurerm_resource_group.iot.name
  size                  = "Standard_B2ats_v2"
  admin_username        = "azureuser"
  network_interface_ids = [azurerm_network_interface.iot.id]

  admin_ssh_key {
    username   = "azureuser"
    public_key = file(pathexpand(var.ssh_public_key_path))
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }
}

output "server_ip" {
  value = azurerm_public_ip.iot.ip_address
}
