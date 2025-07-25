package table

import "time"

type Logging struct {
	Id        *uint64    `gorm:"primaryKey"`
	UserId    *uint64    `gorm:"not null; index"`
	ImageName *string    `gorm:"type:VARCHAR(255); default:NULL"`
	Timestamp *time.Time `gorm:"type:TIMESTAMP;default:CURRENT_TIMESTAMP;not null"`

	Status *string `gorm:"type:VARCHAR(255); default:NULL`
	User   User    `gorm:"foreignKey:UserId;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
