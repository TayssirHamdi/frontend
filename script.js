// Local testing
const API_URL = "/api/customers";


// AWS deployment
//const API_URL = "http://<backend-alb-dns>:8080/api/customers";

let actionsCount = 0;

// Load customers on page load
window.onload = loadCustomers;

// Load customers function
function loadCustomers() {
    fetch(API_URL)
        .then(res => res.json())
        .then(customers => {
            const tbody = document.getElementById("customerTable");
            tbody.innerHTML = "";
            document.getElementById("totalCustomers").innerText = customers.length;

            customers.forEach((c, index) => {
                tbody.innerHTML += `
                    <tr class="fade-in">
                        <td>${index + 1}</td>
                        <td>${c.name}</td>
                        <td>${c.address}</td>
                        <td>${c.phone}</td>
                        <td>
                            <button class="btn btn-success btn-sm" onclick="openUpdateModal(${c.id}, '${c.name}', '${c.address}', '${c.phone}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${c.id}, '${c.name}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            // Show last added customer
            if(customers.length > 0)
                document.getElementById("recentCustomer").innerText = customers[customers.length-1].name;
        })
        .catch(err => console.error(err));
}

// Search function
function searchCustomer() {
    const query = document.getElementById("search").value.toLowerCase();
    const rows = document.querySelectorAll("#customerTable tr");
    rows.forEach(row => {
        const name = row.cells[1].innerText.toLowerCase();
        row.style.display = name.includes(query) ? "" : "none";
    });
}

// Add customer
function addCustomer() {
    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;
    const phone = document.getElementById("phone").value;

    if(!name || !address || !phone) return Swal.fire('Oops','Please fill all fields','warning');

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, phone })
    })
    .then(res => res.json())
    .then(() => {
        document.getElementById("name").value = "";
        document.getElementById("address").value = "";
        document.getElementById("phone").value = "";
        actionsCount++;
        document.getElementById("actionsToday").innerText = actionsCount;
        loadCustomers();
        Swal.fire('Success','Customer added!','success');
    });
}

// Open Update Modal
function openUpdateModal(id, name, address, phone) {
    $('#updateModal').modal('show');
    document.getElementById("update-id").value = id;
    document.getElementById("update-name").value = name;
    document.getElementById("update-address").value = address;
    document.getElementById("update-phone").value = phone;
}

// Save Update
function saveUpdate() {
    const id = document.getElementById("update-id").value;
    const name = document.getElementById("update-name").value;
    const address = document.getElementById("update-address").value;
    const phone = document.getElementById("update-phone").value;

    fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, phone })
    })
    .then(res => res.json())
    .then(() => {
        $('#updateModal').modal('hide');
        actionsCount++;
        document.getElementById("actionsToday").innerText = actionsCount;
        loadCustomers();
        Swal.fire('Updated','Customer details updated','success');
    });
}

// Delete customer with confirmation
function deleteCustomer(id, name) {
    Swal.fire({
        title: `Delete ${name}?`,
        text: "This cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if(result.isConfirmed) {
            fetch(`${API_URL}/${id}`, { method: "DELETE" })
                .then(res => res.json())
                .then(() => {
                    actionsCount++;
                    document.getElementById("actionsToday").innerText = actionsCount;
                    loadCustomers();
                    Swal.fire('Deleted!','Customer removed','success');
                });
        }
    });
}
