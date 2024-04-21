document.addEventListener("DOMContentLoaded", function() {
    const getProperties = async () => {
        try {
            return (await fetch("/api/properties")).json();
        } catch (error) {
            console.log(error);
        }
    };
  
    const showProperties = async () => {
        let properties = await getProperties();
        let galleryContainer = document.getElementById("gallery-container");
        galleryContainer.innerHTML = "";
        properties.forEach((property) => {
            const propertyCard = document.createElement("section");
            propertyCard.classList.add("gallery-item");
            galleryContainer.appendChild(propertyCard);
  
            const propertyLink = document.createElement("a");
            propertyLink.href = "#";
            propertyCard.appendChild(propertyLink);
  
            const propertyImage = document.createElement("img");
            propertyImage.src = `/images/${property.img}`;
            propertyImage.onclick = () => {
                console.log("Property clicked:", property);
                displayPropertyDetails(property);
            };
            propertyLink.appendChild(propertyImage);
        });
    };
  
    const displayPropertyDetails = (property) => {
        openDialog("property-details");
    
        const dialogDetails = document.getElementById("property-details");
        dialogDetails.innerHTML = "";
    
        const h2 = document.createElement("h2");
        h2.textContent = property.address;
        dialogDetails.appendChild(h2);
    
        const deleteLink = document.createElement("a");
        deleteLink.innerHTML = "&#9249";
        dialogDetails.append(deleteLink);
        deleteLink.id = "delete-link";
    
        const editLink = document.createElement("a");
        editLink.innerHTML = "&#9998";
        dialogDetails.append(editLink);
        editLink.id = "edit-link";
    
        const p = document.createElement("p");
        dialogDetails.appendChild(p);
        p.innerHTML = property.description;
    
        const img = document.createElement("img");
        img.src = `/images/${property.img}`;
        img.alt = property.address;
        img.style.maxWidth = "350px";
        img.style.maxHeight = "300px";
        img.style.width = "auto";
        img.style.height = "auto";
        dialogDetails.appendChild(img);
    

        const schoolList = document.createElement("ul");
        property.nearbySchools.forEach((school) => {
            const li = document.createElement("li");
            li.textContent = school;
            schoolList.appendChild(li);
        });
        dialogDetails.appendChild(schoolList);

        // if (Array.isArray(property.nearby_schools)) {
        //     populateNearbySchools(property.nearby_schools);
        // } else {
        //     console.log("Nearby schools data is not in the expected format.");
        // }
    
        editLink.onclick = showPropertyForm;
        deleteLink.onclick = deleteProperty.bind(this, property);
    
        populateEditForm(property);
    };
  
    const populateEditForm = (property) => {
        if(property){
        console.log("populating edit form");
        const form = document.getElementById("add-property-form");
        form._id.value = property ? property._id : "";
        form.address.value = property.address;
        form.description.value = property.description;
        form.bedrooms.value = property.bedrooms;
        form.bathrooms.value = property.bathrooms;
        form.sqft.value = property.sqft;
        form.price_estimate.value = property.price_estimate;
        document.getElementById("img-prev").src = `/images/${property.img}`;
        populateNearbySchools(property.nearby_schools);
        } else {
            console.log("property is undefined");
        }
    };
  
    const populateNearbySchools = (schools) => {

        console.log("populating schools");
        const section = document.getElementById("nearby-schools-boxes");
        schools.forEach((school) => {
            const input = document.createElement("input");
            input.type = "text";
            input.value = school;
            section.append(input);
        });
        
        
        // const section = document.getElementById("nearby-schools-boxes");
        // section.innerHTML = ""; // Clear existing content
    
        // // Check if schools is an array before iterating
        // if (Array.isArray(schools)) {
        //     schools.forEach((school) => {
        //         const input = document.createElement("input");
        //         input.type = "text";
        //         input.value = school;
        //         section.append(input);
        //     });
        // } else {
        //     console.log("Nearby schools data is not in the expected format.");
        // }
    };
    
  
    const addEditProperty = async (e) => {
        e.preventDefault();
        const form = document.getElementById("add-property-form");
        const formData = new FormData(form);
        let response;
        // const nearbySchools = getNearbySchools();

        // formData.delete('_id');
        formData.append("nearby_schools", getNearbySchools());
    
        console.log(...formData);
    
        if (form._id.value.trim() == "") {
            console.log("inside the POST");
            response = await fetch("/api/properties", {
                method: "POST",
                body: formData,
            });
        } else {
            response = await fetch(`/api/properties/${form._id.value}`, {
                method: "PUT",
                body: formData,
            });
        }
    
        if (response.status != 200) {
            console.log("error adding or editing data");
        }

        // const newImage = document.querySelector(`img[src="/images/${response.img_name}"]`);
        // if (newImage) {
        //     newImage.classList.add("newImg");
        // }
    
        await response.json();
        resetForm();
        document.getElementById("dialog").style.display = "none";
        showProperties();
    };
    
    
    const deleteProperty = async(property) => {
        let response = await fetch(`/api/properties/${property._id}`, {
            method:"DELETE",
            headers:{
                "Content-Type":"application/json;charset=utf-8"
            }
        });
  
        if(response.status != 200) {
            console.log("Error Deleting");
            return;
        }
  
        let result = await response.json();
        resetForm();
        showProperties();
        document.getElementById("dialog").style.display = "none";
    };
  
    const getNearbySchools = () => {
        const inputs = document.querySelectorAll("#nearby-schools-boxes input");
        const schools = [];
    
        inputs.forEach((input) => {
                schools.push(input.value);
        });
        return schools;
    };
  
    const resetForm = () => {
        console.log("reset form");
        const form = document.getElementById("add-property-form");
        form.reset();
        form._id.value = "";
        document.getElementById("nearby-schools-boxes").innerHTML = "";
        document.getElementById("img-prev").src = "";
    };
  
    const showPropertyForm = (e) => {
        console.log("hello");
    
        openDialog("add-property-form");
        console.log(e.target);
        if (e.target.getAttribute("id") != "edit-link") {
            resetForm();
        }


        // openDialog("property-details");
        // resetForm();
    
        // const modal = document.getElementById("dialog");
        // modal.style.display = "block"; // Show the modal
    };
    
  
  
    const addSchool = (e) => {
        e.preventDefault();
        const section = document.getElementById("nearby-schools-boxes");
        const input = document.createElement("input");
        input.type = "text";
        section.append(input);
    };
  
    const openDialog = (id) => {
        document.getElementById("dialog").style.display = "block";
        document.querySelectorAll("#dialog-details > *").forEach((section) => {
            section.classList.add("hidden");
        });
        document.getElementById(id).classList.remove("hidden");
    };
  
    const cancelForm = () => {
        resetForm();
        document.getElementById("dialog").style.display = "none";
        showProperties();
    }
  
    showProperties();
    document.getElementById("add-property-form").onsubmit = addEditProperty;
    document.getElementById("add-link").onclick = showPropertyForm;
    document.getElementById("add-school").onclick = addSchool;
    document.getElementById("cancel-button").onclick = cancelForm;
  
    document.getElementById("img").onchange = (e) => {
        if (!e.target.files.length) {
            document.getElementById("img-prev").src = "";
            return;
        }
        document.getElementById("img-prev").src = URL.createObjectURL(
            e.target.files.item(0)
        );
    };
  });