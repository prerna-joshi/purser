/*
* Copyright (c) 2018 VMware Inc. All Rights Reserved.
* SPDX-License-Identifier: Apache-2.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
 */

package apiHandlers

import (
	"encoding/json"
	"net/http"

	"github.com/Sirupsen/logrus"
	"github.com/vmware/purser/pkg/controller/dgraph/models"
	"github.com/vmware/purser/pkg/controller/utils"
	"github.com/vmware/purser/pkg/pricing"
	apps_v1beta1 "k8s.io/api/apps/v1beta1"
	"k8s.io/apimachinery/pkg/util/yaml"
)

// GetCloudRegionList listens on /api/clouds/regions endpoint
func GetCloudRegionList(w http.ResponseWriter, r *http.Request) {
	addAccessControlHeaders(&w, r)
	logrus.Printf("Update regions")
	pricing.PopulateAllRateCards()
	logrus.Printf("All records updated")
	// encodeAndWrite(w,)
}

// CompareCloud listens on /api/clouds/compare endpoint
func CompareCloud(w http.ResponseWriter, r *http.Request) {
	addAccessControlHeaders(&w, r)
	queryParams := r.URL.Query()
	logrus.Debugf("Query params: (%v)", queryParams)

	regionData, err := convertRequestBodyToJSON(r)
	if err != nil {
		logrus.Errorf("unable to parse request as either JSON or YAML, err: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	var region []models.CloudRegion

	if jsonErr := json.Unmarshal(regionData, &region); jsonErr != nil {
		logrus.Errorf("unable to parse object as group, err: %v", jsonErr)
		http.Error(w, jsonErr.Error(), http.StatusBadRequest)
		return
	}
	logrus.Printf("region  %#v ", region)
	nodeCost := models.GetCostForClusterNodes(region)
	encodeAndWrite(w, nodeCost)
}

// InfrastructurePlanning ...
func InfrastructurePlanning(w http.ResponseWriter, r *http.Request) {
	addAccessControlHeaders(&w, r)
	r.ParseMultipartForm(int64(2 * 1024 * 1024))
	fileData := r.FormValue("fileKey")
	deploymentData, err := yaml.ToJSON([]byte(fileData))
	//deploymentData, err := convertRequestBodyToJSON(r)
	if err != nil {
		logrus.Errorf("unable to parse request as either JSON or YAML, err: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	// logrus.Infof("deploymentData: \n<%+v>\n", deploymentData)
	deployment := apps_v1beta1.Deployment{}
	if jsonErr := json.Unmarshal(deploymentData, &deployment); jsonErr != nil {
		logrus.Errorf("unable to parse object as deployment, err: %v", jsonErr)
		http.Error(w, jsonErr.Error(), http.StatusBadRequest)
		return
	}
	logrus.Infof("deployment: \n<%+v>\n", deployment)

	replicas := *deployment.Spec.Replicas
	cpu := deployment.Spec.Template.Spec.Containers[0].Resources.Requests.Cpu()
	memory := deployment.Spec.Template.Spec.Containers[0].Resources.Requests.Memory()
	logrus.Infof("replicas: %v", replicas)
	logrus.Infof("CPU: %v, Memory: %v", cpu, memory)

	nodes := []models.Node{}
	for i := 0; i < int(replicas); i++ {
		nodes = append(nodes, models.Node{CPUCapacity: utils.ConvertToFloat64CPU(cpu), MemoryCapacity: utils.ConvertToFloat64GB(memory)})
	}

	// JSON to goStruct
	nodesRecommender := pricing.InfraPlanningService(nodes)
	encodeAndWrite(w, nodesRecommender)
}
