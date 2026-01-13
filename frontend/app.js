const API_URL = 'http://localhost:5000/api/products';
let editingProductId = null;

// ============ DÉCLARATIONS DES FONCTIONS EN PREMIER ============

// Fonction pour charger les produits
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erreur réseau');
        
        const products = await response.json();
        displayProducts(products);
        updateProductCount(products.length);
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('productList').innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> Impossible de charger les produits
            </div>
        `;
    }
}

// Afficher les produits
function displayProducts(products) {
    const container = document.getElementById('productList');
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> Aucun produit. Ajoutez-en un!
            </div>
        `;
        return;
    }
    
    let html = '<div class="list-group">';
    
    products.forEach(product => {
        html += `
            <div class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${product.name}</h5>
                    <small>$${product.price.toFixed(2)}</small>
                </div>
                <p class="mb-1">
                    <span class="badge bg-info">${product.category}</span>
                    <span class="badge bg-secondary ms-2">Stock: ${product.stock}</span>
                </p>
                <small>Ajouté le: ${new Date(product.createdAt).toLocaleDateString()}</small>
                <div class="mt-2">
                    <button class="btn btn-sm btn-warning" onclick="editProduct('${product._id}')">
                        <i class="bi bi-pencil"></i> Modifier
                    </button>
                    <button class="btn btn-sm btn-danger ms-2" onclick="deleteProduct('${product._id}')">
                        <i class="bi bi-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Mettre à jour le compteur
function updateProductCount(count) {
    document.getElementById('productCount').textContent = count;
}

// Créer un produit
async function createProduct(product) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        
        if (!response.ok) throw new Error('Erreur création');
        
        showAlert('Produit ajouté avec succès!', 'success');
    } catch (error) {
        showAlert('Erreur lors de l\'ajout', 'danger');
    }
}

// Mettre à jour un produit
async function updateProduct(id, product) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        
        if (!response.ok) throw new Error('Erreur mise à jour');
        
        showAlert('Produit modifié avec succès!', 'success');
        editingProductId = null;
    } catch (error) {
        showAlert('Erreur lors de la modification', 'danger');
    }
}

// Supprimer un produit
async function deleteProduct(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erreur suppression');
        
        showAlert('Produit supprimé avec succès!', 'success');
        await loadProducts();
    } catch (error) {
        showAlert('Erreur lors de la suppression', 'danger');
    }
}

// Éditer un produit
async function editProduct(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Erreur chargement');
        
        const product = await response.json();
        
        // Remplir le formulaire
        document.getElementById('productId').value = product._id;
        document.getElementById('name').value = product.name;
        document.getElementById('price').value = product.price;
        document.getElementById('category').value = product.category;
        document.getElementById('stock').value = product.stock;
        
        // Changer le titre du formulaire
        document.getElementById('formTitle').innerHTML = 
            '<i class="bi bi-pencil"></i> Modifier le produit';
        
        // Afficher le bouton Annuler
        document.getElementById('cancelBtn').classList.remove('d-none');
        
        editingProductId = id;
        
        // Faire défiler vers le formulaire
        document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showAlert('Erreur lors du chargement', 'danger');
    }
}

// Réinitialiser le formulaire
function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('formTitle').innerHTML = 
        '<i class="bi bi-plus-circle"></i> Ajouter un produit';
    document.getElementById('cancelBtn').classList.add('d-none');
}

// Afficher une alerte
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = '1050';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Supprimer automatiquement après 3 secondes
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// ============ CODE D'INITIALISATION APRÈS ============

// Charger les produits au démarrage
document.addEventListener('DOMContentLoaded', loadProducts);

// Gestion du formulaire
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const product = {
        name: document.getElementById('name').value,
        price: parseFloat(document.getElementById('price').value),
        category: document.getElementById('category').value,
        stock: parseInt(document.getElementById('stock').value)
    };

    if (editingProductId) {
        await updateProduct(editingProductId, product);
    } else {
        await createProduct(product);
    }
    
    resetForm();
    await loadProducts();
});

// Annuler l'édition
document.getElementById('cancelBtn').addEventListener('click', resetForm);